import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { WishFolderModal } from '@/features/cabinet/components/WishFolderModal';
import { WhiskeyRequestModal } from '@/features/admin/components/WhiskeyRequestModal';
import { cabinetApi } from '@/features/cabinet/api/cabinetApi';
import { PATHS } from '@/app/router/paths';
import { SearchPagination } from '../components/SearchPagination';
import {
  autocompleteWhiskeys,
  correctWhiskeyKeyword,
  fetchWhiskeys,
  filterWhiskeys,
  searchWhiskeys,
  type WhiskeyCard,
  type WhiskeyType,
} from '../api/whiskeyApi';
import '../search.css';

const DEFAULT_PAGE_SIZE = 20;
const ABV_RANGE_MIN = 1;
const ABV_RANGE_MAX = 100;
const AGE_RANGE_MIN = 0;
const AGE_RANGE_MAX = 100;

const WHISKEY_TYPE_OPTIONS: { label: string; value: WhiskeyType }[] = [
  { label: '싱글몰트', value: 'single_malt' },
  { label: '블렌디드', value: 'blended' },
  { label: '버번', value: 'bourbon' },
  { label: '라이', value: 'rye' },
  { label: '기타', value: 'etc' },
];

const NOSE_TAGS = [
  '시트러스',
  '베리류',
  '꽃향',
  '허브향',
  '곡물향',
  '견과향',
  '꿀향',
  '바닐라향',
  '캐러멜향',
  '초콜릿향',
  '커피향',
  '후추향',
  '계피향',
  '정향',
  '우디(나무, 오크)',
  '가죽향',
  '스모키',
  '피트향',
  '흙내음',
  '약품향',
];

const TASTE_TAGS = [
  '시트러스',
  '베리류',
  '허브맛',
  '곡물맛',
  '견과류맛',
  '꿀맛',
  '바닐라맛',
  '캐러멜맛',
  '초콜릿맛',
  '커피맛',
  '우디(나무, 오크)',
  '스모키',
  '피트감',
  '흙맛',
  '짠맛',
];

type TagModalType = 'nose' | 'taste' | null;

function buildMeta(whiskey: WhiskeyCard) {
  const age = whiskey.ageYears == null ? null : whiskey.ageYears === 0 ? 'NAS' : `${whiskey.ageYears}년`;
  return [whiskey.country, whiskey.abv != null ? `${whiskey.abv}%` : null, age]
    .filter(Boolean)
    .join(' · ');
}

function hasActiveFilters(
  selectedTypes: WhiskeyType[],
  selectedNoseTags: string[],
  selectedTasteTags: string[],
  minAbv: number,
  maxAbv: number,
  minAge: number,
  maxAge: number,
) {
  return (
    selectedTypes.length > 0 ||
    selectedNoseTags.length > 0 ||
    selectedTasteTags.length > 0 ||
    minAbv !== ABV_RANGE_MIN ||
    maxAbv !== ABV_RANGE_MAX ||
    minAge !== AGE_RANGE_MIN ||
    maxAge !== AGE_RANGE_MAX
  );
}

function toggleItem<T>(items: T[], item: T) {
  if (items.includes(item)) {
    return items.filter((value) => value !== item);
  }

  return [...items, item];
}

interface DualRangeSliderProps {
  minLimit: number;
  maxLimit: number;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  unit: string;
}

function DualRangeSlider({
  minLimit,
  maxLimit,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  unit,
}: DualRangeSliderProps) {
  const low = Math.min(minValue, maxValue);
  const high = Math.max(minValue, maxValue);
  const left = ((low - minLimit) / (maxLimit - minLimit)) * 100;
  const right = 100 - ((high - minLimit) / (maxLimit - minLimit)) * 100;

  return (
    <div className="wf-dual-range">
      <p className="wf-dual-range__label">{low}{unit} - {high}{unit}</p>
      <div className="wf-dual-range__track-wrap">
        <div className="wf-dual-range__track" />
        <div className="wf-dual-range__active" style={{ left: `${left}%`, right: `${right}%` }} />
        <input
          className="wf-dual-range__input"
          type="range"
          min={minLimit}
          max={maxLimit}
          value={minValue}
          onChange={(event) => onMinChange(Number(event.target.value))}
        />
        <input
          className="wf-dual-range__input"
          type="range"
          min={minLimit}
          max={maxLimit}
          value={maxValue}
          onChange={(event) => onMaxChange(Number(event.target.value))}
        />
      </div>
    </div>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<WhiskeyType[]>([]);
  const [selectedNoseTags, setSelectedNoseTags] = useState<string[]>([]);
  const [selectedTasteTags, setSelectedTasteTags] = useState<string[]>([]);
  const [minAbv, setMinAbv] = useState(ABV_RANGE_MIN);
  const [maxAbv, setMaxAbv] = useState(ABV_RANGE_MAX);
  const [minAge, setMinAge] = useState(AGE_RANGE_MIN);
  const [maxAge, setMaxAge] = useState(AGE_RANGE_MAX);
  const [tagModalType, setTagModalType] = useState<TagModalType>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  // 위시 상태 — { whiskeyId: itemId } 맵으로 관리
  const [wishedMap, setWishedMap] = useState<Record<number, number>>({});
  const [wishTargetId, setWishTargetId] = useState<number | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const suggestionKeyword = inputValue.trim();
  const isFilterActive = hasActiveFilters(
    selectedTypes,
    selectedNoseTags,
    selectedTasteTags,
    minAbv,
    maxAbv,
    minAge,
    maxAge,
  );

  useEffect(() => {
    setPage(0);
  }, [keyword, selectedTypes, selectedNoseTags, selectedTasteTags, minAbv, maxAbv, minAge, maxAge]);

  const { data, error, isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: [
      'whiskeys',
      'search',
      keyword,
      selectedTypes,
      selectedNoseTags,
      selectedTasteTags,
      minAbv,
      maxAbv,
      minAge,
      maxAge,
      page,
      pageSize,
    ],
    queryFn: () => {
      if (isFilterActive) {
        return filterWhiskeys({
          keyword: keyword || undefined,
          types: selectedTypes,
          noseTags: selectedNoseTags,
          tasteTags: selectedTasteTags,
          minAbv: Math.min(minAbv, maxAbv),
          maxAbv: Math.max(minAbv, maxAbv),
          minAge: Math.min(minAge, maxAge),
          maxAge: Math.max(minAge, maxAge),
          page,
          size: pageSize,
        });
      }

      if (keyword) {
        return searchWhiskeys({ q: keyword, page, size: pageSize });
      }

      return fetchWhiskeys({ page, size: pageSize });
    },
    placeholderData: (previousData) => previousData,
  });

  const { data: autocompleteItems = [] } = useQuery({
    queryKey: ['whiskeys', 'autocomplete', suggestionKeyword],
    queryFn: () => autocompleteWhiskeys({ q: suggestionKeyword, size: 8 }),
    enabled: suggestionKeyword.length > 0,
    retry: false,
  });

  const results = data?.content ?? [];
  const totalCount = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const isInitialLoading = isLoading && results.length === 0;
  const searchErrorMessage =
    error instanceof Error && error.message !== '요청에 실패했습니다.'
      ? error.message
      : '검색 서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.';
  const suggestions = autocompleteItems.filter((item) => item.keyword !== suggestionKeyword);
  const shouldCheckCorrection = Boolean(keyword) && !isLoading && !isError && totalCount === 0;

  // 검색 결과 바뀔 때마다 위시 등록 여부 체크
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || results.length === 0) return;

    cabinetApi.getWishFolders().then(async (res) => {
      const folders = res.data.data ?? [];
      if (folders.length === 0) return;

      const newMap: Record<number, number> = {};
      for (const folder of folders) {
        const itemRes = await cabinetApi.getWishItems(folder.folderId);
        const items = itemRes.data.data ?? [];
        for (const item of items as { whiskey: { id: number }; itemId: number }[]) {
          // 검색 결과에 있는 위스키만 map에 등록
          if (results.some((r) => r.id === item.whiskey.id)) {
            newMap[item.whiskey.id] = item.itemId;
          }
        }
      }
      setWishedMap(newMap);
    }).catch(() => {});
  }, [results]);

  const { data: correction } = useQuery({
    queryKey: ['whiskeys', 'correction', keyword],
    queryFn: () => correctWhiskeyKeyword(keyword),
    enabled: shouldCheckCorrection,
    retry: false,
  });

  const correctedKeyword =
    correction?.correctedKeyword && correction.correctedKeyword !== keyword
      ? correction.correctedKeyword
      : null;

  // 위시 버튼 클릭 — 항상 모달 열기 (B방법)
  const handleWishClick = async (e: React.MouseEvent, whiskeyId: number) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('accessToken');
    if (!token) {
      const goLogin = confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?');
      if (goLogin) navigate(PATHS.LOGIN);
      return;
    }

    // 등록 여부 상관없이 항상 모달 열기
    setWishTargetId(whiskeyId);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSuggestionOpen(false);
    setPage(0);
    setKeyword(inputValue.trim());
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setPage(0);
  };

  const selectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setKeyword(suggestion);
    setIsSuggestionOpen(false);
  };

  const applyCorrection = (suggestion: string) => {
    setInputValue(suggestion);
    setKeyword(suggestion);
    setIsSuggestionOpen(false);
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedNoseTags([]);
    setSelectedTasteTags([]);
    setMinAbv(ABV_RANGE_MIN);
    setMaxAbv(ABV_RANGE_MAX);
    setMinAge(AGE_RANGE_MIN);
    setMaxAge(AGE_RANGE_MAX);
  };

  const currentTagOptions = tagModalType === 'nose' ? NOSE_TAGS : TASTE_TAGS;
  const currentSelectedTags = tagModalType === 'nose' ? selectedNoseTags : selectedTasteTags;
  const tagModalTitle = tagModalType === 'nose' ? '향 태그' : '맛 태그';

  return (
    <WireframePage>
      {showRequestModal && (
        <WhiskeyRequestModal
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {}}
        />
      )}
      {wishTargetId !== null && (
        <WishFolderModal
          whiskeyId={wishTargetId}
          onClose={() => setWishTargetId(null)}
          onSuccess={() => {
            // 모달에서 추가/제거 후 하트 상태 갱신
            const targetId = wishTargetId;
            if (targetId === null) return;
            cabinetApi.getWishedFolderIds(targetId)
              .then((res) => {
                const folderIds: number[] = res.data.data ?? [];
                if (folderIds.length > 0) {
                  // 하나 이상의 폴더에 등록됨 → 채운 하트
                  setWishedMap((prev) => ({ ...prev, [targetId]: folderIds[0] }));
                } else {
                  // 모든 폴더에서 제거됨 → 빈 하트
                  setWishedMap((prev) => {
                    const next = { ...prev };
                    delete next[targetId];
                    return next;
                  });
                }
              })
              .catch(() => {});
          }}
        />
      )}
      <p className="wf-breadcrumb">홈 / <strong>검색</strong></p>
      <div className="wf-layout-sidebar">
        <aside className="wf-sidebar wf-search-sidebar">
          <div className="wf-search-filter-header">
            <p className="wf-text-label">필터</p>
            <button type="button" className="wf-link" onClick={resetFilters}>
              초기화
            </button>
          </div>

          <section className="wf-search-filter-section">
            <p className="wf-text-label">위스키 종류</p>
            {WHISKEY_TYPE_OPTIONS.map((option) => (
              <label key={option.value} className={`wf-box wf-search-filter-checkbox${selectedTypes.includes(option.value) ? ' wf-box--accent' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(option.value)}
                  onChange={() => setSelectedTypes((types) => toggleItem(types, option.value))}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </section>

          <section className="wf-search-filter-section">
            <p className="wf-text-label">노트</p>
            <button
              type="button"
              className={`wf-box wf-search-filter-tag-btn${selectedNoseTags.length > 0 ? ' wf-box--accent' : ''}`}
              onClick={() => setTagModalType('nose')}
            >
              향 {selectedNoseTags.length > 0 ? `선택됨 ${selectedNoseTags.length}개` : '선택'}
            </button>
            <button
              type="button"
              className={`wf-box wf-search-filter-tag-btn${selectedTasteTags.length > 0 ? ' wf-box--accent' : ''}`}
              onClick={() => setTagModalType('taste')}
            >
              맛 {selectedTasteTags.length > 0 ? `선택됨 ${selectedTasteTags.length}개` : '선택'}
            </button>
          </section>

          <section className="wf-search-filter-section">
            <p className="wf-text-label">도수</p>
            <div className={`wf-box wf-search-filter-range-box${minAbv !== ABV_RANGE_MIN || maxAbv !== ABV_RANGE_MAX ? ' wf-box--accent' : ''}`}>
              <DualRangeSlider
                minLimit={ABV_RANGE_MIN}
                maxLimit={ABV_RANGE_MAX}
                minValue={minAbv}
                maxValue={maxAbv}
                onMinChange={setMinAbv}
                onMaxChange={setMaxAbv}
                unit="%"
              />
            </div>
          </section>

          <section className="wf-search-filter-section">
            <p className="wf-text-label">숙성연수</p>
            <div className={`wf-box wf-search-filter-range-box${minAge !== AGE_RANGE_MIN || maxAge !== AGE_RANGE_MAX ? ' wf-box--accent' : ''}`}>
              <DualRangeSlider
                minLimit={AGE_RANGE_MIN}
                maxLimit={AGE_RANGE_MAX}
                minValue={minAge}
                maxValue={maxAge}
                onMinChange={setMinAge}
                onMaxChange={setMaxAge}
                unit="년"
              />
            </div>
          </section>

          {/* 2번: 필터 하단 등록 요청 버튼 */}
          <button
            type="button"
            className="wf-search-register-link"
            onClick={() => {
              if (!localStorage.getItem('accessToken')) {
                const go = confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?');
                if (go) navigate(PATHS.LOGIN);
                return;
              }
              setShowRequestModal(true);
            }}
          >
            + 원하는 위스키 등록 요청
          </button>
        </aside>
        <div className="wf-search-main">
          <form onSubmit={handleSubmit} className="wf-search-form">
            <div className="wf-search-autocomplete">
              <Input
                aria-label="위스키 검색어"
                placeholder="위스키 이름을 검색해보세요"
                value={inputValue}
                autoComplete="off"
                onFocus={() => setIsSuggestionOpen(true)}
                onChange={(event) => {
                  setInputValue(event.target.value);
                  setIsSuggestionOpen(true);
                }}
              />
              {isSuggestionOpen && suggestions.length > 0 ? (
                <div className="wf-search-autocomplete__menu">
                  {suggestions.map((item) => (
                    <button
                      key={item.keyword}
                      type="button"
                      className="wf-search-autocomplete__item"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectSuggestion(item.keyword)}
                    >
                      {item.keyword}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <Button type="submit" className="wf-search-form__btn">
              검색
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="wf-search-form__reset"
              onClick={() => {
                setInputValue('');
                setKeyword('');
                setPage(0);
                setIsSuggestionOpen(false);
                resetFilters();
              }}
            >
              전체 목록
            </Button>
          </form>

          <div className="wf-search-result-status">
            <div>
              <p className="wf-text-label">Search result</p>
              <strong>
                {isInitialLoading ? '위스키를 찾는 중입니다' : keyword ? `"${keyword}" 검색 결과` : '전체 위스키'}
              </strong>
            </div>
            <span>
              {isInitialLoading ? 'Loading' : `${totalCount.toLocaleString()}건`}
              {isFilterActive ? ' · 필터 적용' : ''}
              {isFetching && !isInitialLoading ? ' · 갱신 중' : ''}
            </span>
          </div>

          {correctedKeyword ? (
            <div className="wf-search-correction wf-box">
              <span className="wf-text-sm">혹시 </span>
              <button
                type="button"
                className="wf-search-correction__button"
                onClick={() => applyCorrection(correctedKeyword)}
              >
                {correctedKeyword}
              </button>
              <span className="wf-text-sm"> 을 찾으셨나요?</span>
            </div>
          ) : null}

          {isError ? (
            <div className="wf-box wf-search-state-box wf-search-error-box">
              <p className="wf-text-label">Connection issue</p>
              <p className="wf-card__title">위스키 목록을 불러오지 못했습니다.</p>
              <p className="wf-card__meta">{searchErrorMessage}</p>
              <div className="wf-search-state-actions">
                <Button variant="ghost" size="sm" onClick={() => refetch()}>
                  다시 시도
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInputValue('');
                    setKeyword('');
                    setPage(0);
                    resetFilters();
                  }}
                >
                  검색 초기화
                </Button>
              </div>
            </div>
          ) : null}

          {isInitialLoading ? (
            <div className="wf-search-skeleton-list" aria-label="검색 결과를 불러오는 중">
              <div className="wf-search-skeleton-intro wf-box">
                <p className="wf-text-label">Curating bottles</p>
                <strong>조건에 맞는 위스키를 정리하고 있어요.</strong>
                <span>잠시만 기다리면 추천 후보가 차례로 나타납니다.</span>
              </div>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="wf-box wf-search-skeleton-card">
                  <div className="wf-search-skeleton-card__thumb" />
                  <div className="wf-search-skeleton-card__body">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!isInitialLoading && !isError && results.length === 0 ? (
            <div className="wf-box wf-search-state-box wf-search-empty-box">
              <p className="wf-text-label">No matches</p>
              <p className="wf-card__title">검색 결과가 없습니다.</p>
              <p className="wf-card__meta">
                검색어를 조금 줄이거나 필터를 초기화해보세요. 찾는 위스키가 없다면 등록 요청으로 남길 수 있어요.
              </p>
              {/* 1번: 검색 결과 없을 때 등록 요청 버튼 */}
              <div className="wf-search-state-actions">
                <button
                  type="button"
                  className="wf-search-register-btn"
                  onClick={() => {
                    if (!localStorage.getItem('accessToken')) {
                      const go = confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?');
                      if (go) navigate(PATHS.LOGIN);
                      return;
                    }
                    setShowRequestModal(true);
                  }}
                >
                  위스키 등록 요청하기
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInputValue('');
                    setKeyword('');
                    setPage(0);
                    resetFilters();
                  }}
                >
                  전체 목록 보기
                </Button>
              </div>
            </div>
          ) : null}

          {results.map((whiskey) => {
            const thumbSrc = resolveMediaUrl(whiskey.imageUrl);
            const isWished = wishedMap[whiskey.id] !== undefined;
            return (
            <Link key={whiskey.id} to={`/whiskey/${whiskey.id}`} className="wf-card wf-box wf-card--clickable wf-search-card">
              {thumbSrc && !imgErrors.has(whiskey.id) ? (
                <img
                  src={thumbSrc}
                  alt={whiskey.name}
                  className="wf-card__thumb wf-search-card__thumb"
                  onError={() => setImgErrors((prev) => new Set(prev).add(whiskey.id))}
                />
              ) : (
                <div className="wf-card__thumb wf-placeholder wf-search-card__thumb" />
              )}
              <div className="wf-card__body">
                <div className="wf-card__title">{whiskey.name}</div>
                <div className="wf-card__meta">{buildMeta(whiskey)}</div>
                <div className="wf-card__meta">{whiskey.type}</div>
                <Button
                    variant="ghost"
                    className={`wf-search-card__wish${isWished ? ' wf-search-card__wish--on' : ''}`}
                    onClick={(e) => handleWishClick(e, whiskey.id)}
                  >
                    ♥ 위시
                  </Button>
              </div>
            </Link>
            );
          })}

          {!isLoading && !isError && totalCount > 0 ? (
            <SearchPagination
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              totalElements={totalCount}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          ) : null}
        </div>
      </div>

      {tagModalType ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tagModalTitle}
          className="wf-search-tag-modal"
          onClick={() => setTagModalType(null)}
        >
          <div
            className="wf-box wf-box--solid wf-search-tag-modal__inner"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="wf-search-tag-modal__header">
              <div>
                <p className="wf-text-label">{tagModalTitle}</p>
                <p className="wf-text-sm">선택 {currentSelectedTags.length}개</p>
              </div>
              <Button variant="ghost" size="sm" className="wf-search-tag-modal__close" onClick={() => setTagModalType(null)}>
                닫기
              </Button>
            </div>
            <div className="wf-search-tag-modal__grid">
              {currentTagOptions.map((tag) => {
                const selected = currentSelectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`wf-box wf-search-tag-option${selected ? ' wf-box--accent' : ''}`}
                    onClick={() => {
                      if (tagModalType === 'nose') {
                        setSelectedNoseTags((tags) => toggleItem(tags, tag));
                        return;
                      }
                      setSelectedTasteTags((tags) => toggleItem(tags, tag));
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </WireframePage>
  );
}
