import { Link, useSearchParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';

const TABS = [
  { key: 'pick', label: 'My Pick' },
  { key: 'wish', label: '위시리스트' },
  { key: 'note', label: 'My Note' },
  { key: 'reviews', label: '내 리뷰' },
];

const ITEMS = ['글렌피딕 12년', '라프로익 10', '야마자키 12'];

export default function MyBarPage() {
  const [params] = useSearchParams();
  const tab = params.get('tab') ?? 'pick';

  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">홈 / <strong>My Bar</strong></p>
      <h1 className="wf-title">My Bar</h1>
      <nav className="wf-mybar-tabs" aria-label="My Bar 탭">
        {TABS.map(({ key, label }) => (
          <Link key={key} to={`${PATHS.MY_BAR}?tab=${key}`}>
            <span className={`wf-chip${tab === key ? ' wf-chip--on' : ''}`}>{label}</span>
          </Link>
        ))}
      </nav>
      <p className="wf-section-title" style={{ marginTop: 16 }}>
        {TABS.find((t) => t.key === tab)?.label} 목록
      </p>
      {ITEMS.map((name) => (
        <div key={name} className="wf-card wf-box" style={{ padding: 16, marginTop: 8 }}>
          <div className="wf-card__thumb wf-placeholder" style={{ width: 56, height: 72 }} />
          <div className="wf-card__body">
            <div className="wf-card__title">{name}</div>
            <Button variant="ghost" style={{ height: 32, width: 80, marginTop: 8 }}>
              제거
            </Button>
          </div>
        </div>
      ))}
    </WireframePage>
  );
}
