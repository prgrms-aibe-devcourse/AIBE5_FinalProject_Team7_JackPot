import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { PATHS } from '@/app/router/paths';
import {
  autocompleteWhiskeys,
  searchWhiskeys,
  fetchWhiskeys,
  type WhiskeyCard,
} from '@/features/search/api/whiskeyApi';
import '../../review/review.css';

function buildMeta(whiskey: WhiskeyCard) {
  const age = whiskey.ageYears == null ? null : whiskey.ageYears === 0 ? 'NAS' : `${whiskey.ageYears}년`;
  return [whiskey.region, whiskey.country, whiskey.abv != null ? `${whiskey.abv}%` : null, age, whiskey.cask]
    .filter(Boolean)
    .join(' · ');
}

export default function NotePickPage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const suggestionKeyword = inputValue.trim();
  // 키 입력마다 자동완성 API가 호출되지 않도록 입력이 잠시 멈춘 뒤에만 요청
  const [debouncedSuggestion, setDebouncedSuggestion] = useState(suggestionKeyword);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSuggestion(suggestionKeyword), 250);
    return () => clearTimeout(timer);
  }, [suggestionKeyword]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['note-pick', 'whiskeys', keyword],
    queryFn: () =>
      keyword ? searchWhiskeys({ q: keyword, size: 20 }) : fetchWhiskeys({ size: 20 }),
  });

  const { data: autocompleteItems = [] } = useQuery({
    queryKey: ['note-pick', 'autocomplete', debouncedSuggestion],
    queryFn: () => autocompleteWhiskeys({ q: debouncedSuggestion, size: 8 }),
    enabled: debouncedSuggestion.length > 0,
  });

  const results = data?.content ?? [];
  const suggestions = autocompleteItems.filter((item) => item.keyword !== suggestionKeyword);

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
    navigate(PATHS.TASTING_NOTE.replace(':whiskeyId', String(whiskeyId)));
  };

  return (
    <WireframePage scroll>
      <h1 className="wf-title">노트 작성 · 위스키 선택</h1>
      <p className="wf-subtitle wf-pick-subtitle">노트를 작성할 위스키를 검색해서 선택하세요</p>

      <form onSubmit={handleSubmit} className="wf-pick-form">
        <div className="wf-search-autocomplete wf-pick-input-wrap">
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
          {isSuggestionOpen && suggestions.length > 0 && (
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
          )}
        </div>
        <Button type="submit" className="wf-pick-search-btn">검색</Button>
      </form>

      {isLoading && <p className="wf-text-sm">불러오는 중...</p>}

      {isError && (
        <div className="wf-box wf-pick-msg-box">
          <p className="wf-card__title">위스키 목록을 불러오지 못했습니다.</p>
        </div>
      )}

      {!isLoading && !isError && results.length === 0 && (
        <div className="wf-box wf-pick-msg-box">
          <p className="wf-card__title">검색 결과가 없습니다.</p>
          <p className="wf-card__meta">다른 검색어로 다시 찾아보세요.</p>
        </div>
      )}

      {results.map((whiskey) => {
        const thumbSrc = resolveMediaUrl(whiskey.imageUrl);
        return (
          <div
            key={whiskey.id}
            className="wf-card wf-box wf-card--clickable wf-pick-card"
            onClick={() => handleSelect(whiskey.id)}
          >
            {thumbSrc && !imgErrors.has(whiskey.id) ? (
              <img
                src={thumbSrc}
                alt={whiskey.name}
                className="wf-card__thumb wf-pick-card-thumb"
                onError={() => setImgErrors((prev) => new Set(prev).add(whiskey.id))}
              />
            ) : (
              <div className="wf-card__thumb wf-placeholder wf-pick-card-thumb" />
            )}
            <div className="wf-card__body">
              <div className="wf-card__title">{whiskey.name}</div>
              <div className="wf-card__meta">{buildMeta(whiskey)}</div>
            </div>
          </div>
        );
      })}
    </WireframePage>
  );
}
