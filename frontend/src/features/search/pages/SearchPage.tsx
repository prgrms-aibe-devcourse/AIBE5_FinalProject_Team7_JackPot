import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { WishFolderModal } from '@/features/cabinet/components/WishFolderModal';
import { cabinetApi } from '@/features/cabinet/api/cabinetApi';
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

const PAGE_SIZE = 20;
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
  return [whiskey.region, whiskey.country, whiskey.abv != null ? `${whiskey.abv}%` : null, age, whiskey.cask]
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
      <p className="wf-text-sm" style={{ margin: '0 0 10px' }}>{low}{unit} - {high}{unit}</p>
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

  const { data, isLoading, isError, refetch } = useQuery({
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
          page: 0,
          size: PAGE_SIZE,
        });
      }

      if (keyword) {
        return searchWhiskeys({ q: keyword, page: 0, size: PAGE_SIZE });
      }

      return fetchWhiskeys({ page: 0, size: PAGE_SIZE });
    },
  });

  const { data: autocompleteItems = [] } = useQuery({
    queryKey: ['whiskeys', 'autocomplete', suggestionKeyword],
    queryFn: () => autocompleteWhiskeys({ q: suggestionKeyword, size: 8 }),
    enabled: suggestionKeyword.length > 0,
  });

  const results = data?.content ?? [];
  const totalCount = data?.totalElements ?? 0;
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

  const currentTagOptions = tagModalType === 'nose' ? NOSE_TAGS : TASTE_TAGS;
  const currentSelectedTags = tagModalType === 'nose' ? selectedNoseTags : selectedTasteTags;
  const tagModalTitle = tagModalType === 'nose' ? '향 태그' : '맛 태그';

  return (
    <WireframePage>
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
        <aside className="wf-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <p className="wf-text-label" style={{ margin: 0 }}>필터</p>
            <button type="button" className="wf-link" onClick={resetFilters}>
              초기화
            </button>
          </div>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p className="wf-text-label" style={{ margin: 0 }}>위스키 종류</p>
            {WHISKEY_TYPE_OPTIONS.map((option) => (
              <label key={option.value} className={`wf-box${selectedTypes.includes(option.value) ? ' wf-box--accent' : ''}`} style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(option.value)}
                  onChange={() => setSelectedTypes((types) => toggleItem(types, option.value))}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p className="wf-text-label" style={{ margin: 0 }}>노트</p>
            <button
              type="button"
              className={`wf-box${selectedNoseTags.length > 0 ? ' wf-box--accent' : ''}`}
              style={{ padding: 12, color: 'inherit', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => setTagModalType('nose')}
            >
              향 {selectedNoseTags.length > 0 ? `선택됨 ${selectedNoseTags.length}개` : '선택'}
            </button>
            <button
              type="button"
              className={`wf-box${selectedTasteTags.length > 0 ? ' wf-box--accent' : ''}`}
              style={{ padding: 12, color: 'inherit', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => setTagModalType('taste')}
            >
              맛 {selectedTasteTags.length > 0 ? `선택됨 ${selectedTasteTags.length}개` : '선택'}
            </button>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p className="wf-text-label" style={{ margin: 0 }}>도수</p>
            <div className={`wf-box${minAbv !== ABV_RANGE_MIN || maxAbv !== ABV_RANGE_MAX ? ' wf-box--accent' : ''}`} style={{ padding: 12 }}>
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

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p className="wf-text-label" style={{ margin: 0 }}>숙성연수</p>
            <div className={`wf-box${minAge !== AGE_RANGE_MIN || maxAge !== AGE_RANGE_MAX ? ' wf-box--accent' : ''}`} style={{ padding: 12 }}>
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
        </aside>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
            <div className="wf-search-autocomplete" style={{ flex: 1 }}>
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
            <Button type="submit" style={{ width: 96 }}>
              검색
            </Button>
            <Button
              type="button"
              variant="ghost"
              style={{ width: 112 }}
              onClick={() => {
                setInputValue('');
                setKeyword('');
                setIsSuggestionOpen(false);
                resetFilters();
              }}
            >
              전체 목록
            </Button>
          </form>

          <p className="wf-text-sm">
            {isLoading ? '불러오는 중' : keyword ? `"${keyword}" 검색 결과 ${totalCount}건` : `전체 결과 ${totalCount}건`}
            {isFilterActive ? ' · 필터 적용' : ''}
          </p>

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
            <div className="wf-box" style={{ padding: 16 }}>
              <p className="wf-card__title">위스키 목록을 불러오지 못했습니다.</p>
              <p className="wf-card__meta">백엔드 서버와 검색 API가 실행 중인지 확인해주세요.</p>
              <Button variant="ghost" style={{ height: 32, width: 120, marginTop: 8 }} onClick={() => refetch()}>
                다시 시도
              </Button>
            </div>
          ) : null}

          {!isLoading && !isError && results.length === 0 ? (
            <div className="wf-box" style={{ padding: 16 }}>
              <p className="wf-card__title">검색 결과가 없습니다.</p>
              <p className="wf-card__meta">다른 검색어로 다시 찾아보세요.</p>
            </div>
          ) : null}

          {results.map((whiskey) => {
            const thumbSrc = resolveMediaUrl(whiskey.imageUrl);
            return (
            <Link key={whiskey.id} to={`/whiskey/${whiskey.id}`} className="wf-card wf-box wf-card--clickable" style={{ padding: 16, textDecoration: 'none' }}>
              {thumbSrc ? (
                <img
                  src={thumbSrc}
                  alt={whiskey.name}
                  className="wf-card__thumb"
                  style={{ width: 72, height: 96, objectFit: 'cover' }}
                />
              ) : (
                <div className="wf-card__thumb wf-placeholder" style={{ width: 72, height: 96 }} />
              )}
              <div className="wf-card__body">
                <div className="wf-card__title">{whiskey.name}</div>
                <div className="wf-card__meta">{buildMeta(whiskey)}</div>
                <div className="wf-card__meta">{whiskey.type}</div>
                <Button
                    variant="ghost"
                    style={{
                      height: 32,
                      width: 100,
                      marginTop: 8,
                      color: wishedMap[whiskey.id] !== undefined ? '#f87171' : '#8b8b96',
                      borderColor: wishedMap[whiskey.id] !== undefined ? '#f87171' : '#2e2e38',
                    }}
                    onClick={(e) => handleWishClick(e, whiskey.id)}
                  >
                    ♥ 위시
                  </Button>
              </div>
            </Link>
            );
          })}
        </div>
      </div>

      {tagModalType ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tagModalTitle}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(0, 0, 0, 0.62)',
          }}
          onClick={() => setTagModalType(null)}
        >
          <div
            className="wf-box wf-box--solid"
            style={{
              width: 'min(560px, 100%)',
              maxHeight: '80vh',
              overflow: 'hidden',
              padding: 16,
              background: 'var(--wf-surface)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div>
                <p className="wf-text-label" style={{ margin: 0 }}>{tagModalTitle}</p>
                <p className="wf-text-sm" style={{ margin: '4px 0 0' }}>선택 {currentSelectedTags.length}개</p>
              </div>
              <Button variant="ghost" style={{ width: 84, height: 36 }} onClick={() => setTagModalType(null)}>
                닫기
              </Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))', gap: 8, maxHeight: '58vh', overflowY: 'auto' }}>
              {currentTagOptions.map((tag) => {
                const selected = currentSelectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`wf-box${selected ? ' wf-box--accent' : ''}`}
                    style={{ padding: '10px 12px', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}
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
