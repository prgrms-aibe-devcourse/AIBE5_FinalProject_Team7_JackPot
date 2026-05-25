import { useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { fetchWhiskeys, searchWhiskeys, type WhiskeyCard } from '../api/whiskeyApi';

const FILTERS = ['전체', '싱글몰트', '블렌디드', '스코틀랜드', '일본', '40% 이하', '40–50%'];
const PAGE_SIZE = 20;

function buildMeta(whiskey: WhiskeyCard) {
  const age = whiskey.ageYears === 0 ? 'NAS' : `${whiskey.ageYears}년`;
  return [whiskey.region, whiskey.country, whiskey.abv != null ? `${whiskey.abv}%` : null, age, whiskey.cask]
    .filter(Boolean)
    .join(' · ');
}

export default function SearchPage() {
  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['whiskeys', 'search', keyword],
    queryFn: () => {
      if (keyword) {
        return searchWhiskeys({ q: keyword, page: 0, size: PAGE_SIZE });
      }

      return fetchWhiskeys({ page: 0, size: PAGE_SIZE });
    },
  });

  const results = data?.content ?? [];
  const totalCount = data?.totalElements ?? 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeyword(inputValue.trim());
  };

  return (
    <WireframePage>
      <p className="wf-breadcrumb">홈 / <strong>검색</strong></p>
      <div className="wf-layout-sidebar">
        <aside className="wf-sidebar">
          <p className="wf-text-label">필터</p>
          {FILTERS.slice(0,5).map((f,i) => (
            <div key={f} className={`wf-box${i===0?' active':''}`}>{f}</div>
          ))}
          <p className="wf-text-label" style={{ marginTop: 12 }}>도수</p>
          {FILTERS.slice(5).map((f) => (
            <div key={f} className="wf-box">{f}</div>
          ))}
        </aside>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Input
                aria-label="위스키 검색어"
                placeholder="위스키 이름을 검색해보세요"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
              />
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
              }}
            >
              전체 목록
            </Button>
          </form>

          <p className="wf-text-sm">
            {isLoading ? '불러오는 중' : keyword ? `"${keyword}" 검색 결과 ${totalCount}건` : `전체 결과 ${totalCount}건`}
          </p>

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

          {results.map((whiskey) => (
            <Link key={whiskey.id} to={`/whiskey/${whiskey.id}`} className="wf-card wf-box wf-card--clickable" style={{ padding: 16, textDecoration: 'none' }}>
              {whiskey.imageUrl ? (
                <img
                  src={whiskey.imageUrl}
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
                <Button variant="ghost" style={{ height: 32, width: 100, marginTop: 8 }}>♡ 위시</Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </WireframePage>
  );
}
