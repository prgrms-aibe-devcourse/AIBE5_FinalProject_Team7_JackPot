import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Input } from '@/shared/components/ui/Input';
import { PATHS } from '@/app/router/paths';
import {
  autocompleteWhiskeys,
  searchWhiskeys,
  fetchWhiskeys,
  type WhiskeyCard,
  type WhiskeyType,
} from '@/features/search/api/whiskeyApi';
import '@/features/search/search.css';
import '../review.css';

const WHISKEY_TYPE_OPTIONS: { label: string; value: WhiskeyType }[] = [
  { label: '싱글몰트', value: 'single_malt' },
  { label: '블렌디드', value: 'blended' },
  { label: '버번', value: 'bourbon' },
  { label: '라이', value: 'rye' },
  { label: '기타', value: 'etc' },
];

function buildMeta(whiskey: WhiskeyCard) {
  const age = whiskey.ageYears == null ? null : whiskey.ageYears === 0 ? 'NAS' : `${whiskey.ageYears}년`;
  return [whiskey.region, whiskey.country, whiskey.abv != null ? `${whiskey.abv}%` : null, age]
    .filter(Boolean)
    .join(' · ');
}

export default function ReviewPickPage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const suggestionKeyword = inputValue.trim();
  const [debouncedSuggestion, setDebouncedSuggestion] = useState(suggestionKeyword);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSuggestion(suggestionKeyword), 250);
    return () => clearTimeout(timer);
  }, [suggestionKeyword]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['review-pick', 'whiskeys', keyword],
    queryFn: () =>
      keyword ? searchWhiskeys({ q: keyword, size: 20 }) : fetchWhiskeys({ size: 20 }),
  });

  const { data: autocompleteItems = [] } = useQuery({
    queryKey: ['review-pick', 'autocomplete', debouncedSuggestion],
    queryFn: () => autocompleteWhiskeys({ q: debouncedSuggestion, size: 8 }),
    enabled: debouncedSuggestion.length > 0,
  });

  const results = data?.content ?? [];
  const suggestions = autocompleteItems.filter((item) => item.keyword !== suggestionKeyword);
  const isInitialLoading = isLoading && results.length === 0;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSuggestionOpen(false);
    setKeyword(inputValue.trim());
  };

  const selectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setKeyword(suggestion);
    setIsSuggestionOpen(false);
  };

  const handleSelect = (whiskeyId: number) => {
    navigate(PATHS.WRITE_REVIEW.replace(':whiskeyId', String(whiskeyId)));
  };

  return (
    <WireframePage>
      <div className="wf-search-main wf-review-pick-main">
        <header className="wf-review-pick-intro">
          <p className="wf-page-intro__eyebrow">기록</p>
          <h1 className="wf-page-intro__title">리뷰 작성</h1>
          <p className="wf-review-pick-intro__hint">위스키를 검색해 선택하면 리뷰 작성 화면으로 이동합니다.</p>
        </header>

        <form onSubmit={handleSubmit} className="wf-search-form wf-review-pick-form">
          <div className="wf-search-autocomplete">
            <Input
              aria-label="위스키 검색어"
              placeholder="위스키 이름을 검색해보세요"
              value={inputValue}
              autoComplete="off"
              onFocus={() => setIsSuggestionOpen(true)}
              onChange={(e) => {
                setInputValue(e.target.value);
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
                    onMouseDown={(e) => e.preventDefault()}
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
          {!isInitialLoading && keyword ? (
            <h2 className="wf-search-result-comment">&quot;{keyword}&quot; 검색 결과</h2>
          ) : null}
        </div>

        {isError ? (
          <div className="wf-box wf-search-state-box wf-search-error-box">
            <p className="wf-text-label">연결 문제</p>
            <p className="wf-card__title">위스키 목록을 불러오지 못했습니다.</p>
            <p className="wf-card__meta">잠시 후 다시 시도해주세요.</p>
          </div>
        ) : null}

        {isInitialLoading ? (
          <div className="wf-search-skeleton-list" aria-label="위스키 목록을 불러오는 중">
            <div className="wf-search-skeleton-intro wf-box">
              <p className="wf-text-label">불러오는 중</p>
              <strong>위스키 목록을 정리하고 있어요.</strong>
              <span>잠시만 기다리면 후보가 차례로 나타납니다.</span>
            </div>
            {Array.from({ length: 3 }).map((_, index) => (
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
            <p className="wf-card__meta">다른 검색어로 다시 찾아보세요.</p>
          </div>
        ) : null}

        <div className="wf-search-grid">
          {results.map((whiskey) => {
            const thumbSrc = resolveMediaUrl(whiskey.imageUrl);
            const meta = buildMeta(whiskey);
            const typeLabel = WHISKEY_TYPE_OPTIONS.find((o) => o.value === whiskey.type)?.label ?? whiskey.type;
            return (
              <button
                key={whiskey.id}
                type="button"
                className="wf-card wf-box wf-card--clickable wf-search-card wf-review-pick-card"
                onClick={() => handleSelect(whiskey.id)}
              >
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
                  <span className="wf-review-pick-card__cta">선택</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </WireframePage>
  );
}
