import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { confirmToast } from '@/shared/components/ui/ConfirmToast';
import { Input } from '@/shared/components/ui/Input';
import { WhiskeyRequestModal } from '@/features/admin/components/WhiskeyRequestModal';
import { WishFolderModal } from '@/features/cabinet/components/WishFolderModal';
import { cabinetApi } from '@/features/cabinet/api/cabinetApi';
import { useTags } from '@/features/survey/hooks/useTags';
import { PATHS } from '@/app/router/paths';
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

type TagModalType = 'nose' | 'taste' | null;

function buildMeta(whiskey: WhiskeyCard) {
  const age = whiskey.ageYears == null ? null : whiskey.ageYears === 0 ? 'NAS' : `${whiskey.ageYears}년`;
  return [whiskey.region, whiskey.country, whiskey.abv != null ? `${whiskey.abv}%` : null, age]
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
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [wishedMap, setWishedMap] = useState<Record<number, number>>({});
  const [wishTargetId, setWishTargetId] = useState<number | null>(null);
  const pageSize = DEFAULT_PAGE_SIZE;
  const suggestionKeyword = inputValue.trim();
  // 키 입력마다 자동완성 API가 호출되지 않도록 입력이 잠시 멈춘 뒤에만 요청
  const [debouncedSuggestion, setDebouncedSuggestion] = useState(suggestionKeyword);
  const isFilterActive = hasActiveFilters(
    selectedTypes,
    selectedNoseTags,
    selectedTasteTags,
    minAbv,
    maxAbv,
    minAge,
    maxAge,
  );
  const { data: noseTags = [], isLoading: noseTagsLoading } = useTags('nose');
  const { data: tasteTags = [], isLoading: tasteTagsLoading } = useTags('taste');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSuggestion(suggestionKeyword), 250);
    return () => clearTimeout(timer);
  }, [suggestionKeyword]);

  const {
    data,
    error,
    isError,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
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
      pageSize,
    ],
    queryFn: ({ pageParam }) => {
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
          page: pageParam,
          size: pageSize,
        });
      }

      if (keyword) {
        return searchWhiskeys({ q: keyword, page: pageParam, size: pageSize });
      }

      return fetchWhiskeys({ page: pageParam, size: pageSize });
    },
    initialPageParam: 0,
    // 받아온 페이지 수가 전체 페이지 수보다 적으면 다음 페이지 존재
    getNextPageParam: (lastPage, allPages) =>
      allPages.length < (lastPage.totalPages ?? 0) ? allPages.length : undefined,
    placeholderData: (previousData) => previousData,
  });

  const { data: autocompleteItems = [] } = useQuery({
    queryKey: ['whiskeys', 'autocomplete', debouncedSuggestion],
    queryFn: () => autocompleteWhiskeys({ q: debouncedSuggestion, size: 8 }),
    enabled: debouncedSuggestion.length > 0,
    retry: false,
  });

  const results = data?.pages.flatMap((p) => p.content ?? []) ?? [];
  const totalCount = data?.pages[0]?.totalElements ?? 0;
  const isInitialLoading = isLoading && results.length === 0;

  // 스크롤 하단 감지용 sentinel — 보이면 다음 페이지 로드
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
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

  // 위시 버튼 클릭 — 미담김이면 폴더 모달 열기, 담긴 상태면 모든 폴더에서 제거(토글)
  const handleWishClick = async (e: React.MouseEvent, whiskeyId: number) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('accessToken');
    if (!token) {
      const goLogin = await confirmToast({ message: '로그인이 필요합니다. 로그인 페이지로 이동할까요?', danger: false });
      if (goLogin) navigate(PATHS.LOGIN);
      return;
    }

    // 이미 담긴 상태 → 등록된 모든 폴더에서 제거
    if (wishedMap[whiskeyId] !== undefined) {
      try {
        const folderRes = await cabinetApi.getWishedFolderIds(whiskeyId);
        const folderIds: number[] = folderRes.data.data ?? [];
        for (const folderId of folderIds) {
          const itemRes = await cabinetApi.getWishItems(folderId);
          const items = (itemRes.data.data ?? []) as { whiskey: { id: number }; itemId: number }[];
          const target = items.find((it) => it.whiskey.id === whiskeyId);
          if (target) await cabinetApi.removeWish(target.itemId, folderId);
        }
      } catch {
        // 제거 실패는 무시 (상태만 동기화)
      }
      setWishedMap((prev) => {
        const next = { ...prev };
        delete next[whiskeyId];
        return next;
      });
      return;
    }

    // 미담김 → 폴더 선택 모달 열기
    setWishTargetId(whiskeyId);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSuggestionOpen(false);
    setKeyword(inputValue.trim());
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

  const currentTagOptions = (tagModalType === 'nose' ? noseTags : tasteTags)
    .flatMap((group) => group.tags)
    .map((tag) => tag.name);
  const currentTagsLoading = tagModalType === 'nose' ? noseTagsLoading : tasteTagsLoading;
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
      <header className="wf-search-intro">
        <p className="wf-search-intro__eyebrow">탐색</p>
        <h1 className="wf-search-intro__title">검색</h1>
        <p className="wf-search-intro__subtitle">향·맛·도수로 위스키를 찾아보세요.</p>
      </header>
      <div className={`wf-layout-sidebar wf-search-layout${filtersOpen ? ' wf-search-layout--open' : ''}`}>
        <aside className="wf-sidebar wf-search-sidebar">
          <div className="wf-search-sidebar__inner">
          <div className="wf-search-filter-header">
            <p className="wf-text-label">필터</p>
            <button
              type="button"
              className="wf-link"
              onClick={() => {
                setInputValue('');
                setKeyword('');
                setIsSuggestionOpen(false);
                resetFilters();
              }}
            >
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
            onClick={async () => {
              if (!localStorage.getItem('accessToken')) {
                const go = await confirmToast({ message: '로그인이 필요합니다. 로그인 페이지로 이동할까요?', danger: false });
                if (go) navigate(PATHS.LOGIN);
                return;
              }
              setShowRequestModal(true);
            }}
          >
            + 원하는 위스키 등록 요청
          </button>
          </div>
        </aside>
        <div className="wf-search-main">
          <form onSubmit={handleSubmit} className="wf-search-form">
            <button
              type="button"
              className={`wf-search-filter-toggle${isFilterActive ? ' wf-search-filter-toggle--active' : ''}`}
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
            >
              필터 {filtersOpen ? '✕' : '＋'}
            </button>
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
          </form>

          <div className="wf-search-result-status">
            {isInitialLoading || keyword ? (
              <h2 className="wf-search-result-comment">
                {isInitialLoading ? '위스키를 찾는 중입니다' : `"${keyword}" 검색 결과`}
              </h2>
            ) : null}
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
              <p className="wf-text-label">연결 문제</p>
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
                <p className="wf-text-label">불러오는 중</p>
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
              <p className="wf-text-label">결과 없음</p>
              <p className="wf-card__title">검색 결과가 없습니다.</p>
              <p className="wf-card__meta">
                검색어를 조금 줄이거나 필터를 초기화해보세요. 찾는 위스키가 없다면 등록 요청으로 남길 수 있어요.
              </p>
              {/* 1번: 검색 결과 없을 때 등록 요청 버튼 */}
              <div className="wf-search-state-actions">
                <button
                  type="button"
                  className="wf-search-register-btn"
                  onClick={async () => {
                    if (!localStorage.getItem('accessToken')) {
                      const go = await confirmToast({ message: '로그인이 필요합니다. 로그인 페이지로 이동할까요?', danger: false });
                      if (go) navigate(PATHS.LOGIN);
                      return;
                    }
                    setShowRequestModal(true);
                  }}
                >
                  위스키 등록 요청하기
                </button>
              </div>
            </div>
          ) : null}

          <div className="wf-search-grid">
          {results.map((whiskey) => {
            const thumbSrc = resolveMediaUrl(whiskey.imageUrl);
            const meta = buildMeta(whiskey);
            const typeLabel = WHISKEY_TYPE_OPTIONS.find((o) => o.value === whiskey.type)?.label ?? whiskey.type;
            const isWished = wishedMap[whiskey.id] !== undefined;
            return (
              <Link key={whiskey.id} to={`/whiskey/${whiskey.id}`} className="wf-card wf-box wf-card--clickable wf-search-card">
                <div className="wf-search-card__head">
                  <div className="wf-search-card__name">{whiskey.name}</div>
                </div>
                <div className="wf-search-card__media">
                  {thumbSrc && !imgErrors.has(whiskey.id) ? (
                    <img
                      src={thumbSrc}
                      alt={whiskey.name}
                      className="wf-search-card__thumb"
                      onError={() => setImgErrors((prev) => new Set(prev).add(whiskey.id))}
                    />
                  ) : (
                    <div className="wf-placeholder wf-search-card__thumb" />
                  )}
                </div>
                <div className="wf-search-card__footer">
                  {meta || typeLabel ? (
                    <span className="wf-search-card__spec">
                      {[meta, typeLabel].filter(Boolean).join(' · ')}
                    </span>
                  ) : null}
                  <Button
                    variant="ghost"
                    className={`wf-search-card__wish${isWished ? ' wf-search-card__wish--on' : ''}`}
                    onClick={(e) => handleWishClick(e, whiskey.id)}
                  >
                    {isWished ? '담김' : '위시'}
                  </Button>
                </div>
              </Link>
            );
          })}
          </div>

          {isFetchingNextPage ? (
            <p className="wf-search-loadmore">불러오는 중…</p>
          ) : null}
          {/* 하단 도달 감지 sentinel */}
          <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
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
            className="wf-box wf-box--solid wf-search-tag-modal__inner wf-search-tag-modal__inner--glass"
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
              {currentTagsLoading ? (
                <p className="wf-search-tag-modal__loading">태그 불러오는 중…</p>
              ) : currentTagOptions.length === 0 ? (
                <p className="wf-search-tag-modal__loading">표시할 태그가 없습니다.</p>
              ) : (
                currentTagOptions.map((tag) => {
                  const selected = currentSelectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={selected}
                      className={`wf-search-tag-option${selected ? ' wf-search-tag-option--selected' : ''}`}
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
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </WireframePage>
  );
}
