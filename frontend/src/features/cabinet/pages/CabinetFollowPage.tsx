import { WireframePage } from '@/shared/components/layout/WireframePage';

const USERS = [
  { name: '피트러버_서울', meta: '팔로잉 · Pick 8' },
  { name: 'z-imaging', meta: '팔로워 · Pick 12' },
];

/** svg/pages/12-cabinet-follow.svg */
export default function CabinetFollowPage() {
  return (
    <WireframePage scroll>
      <h1 className="wf-title">팔로우 · 팔로워</h1>
      <p className="wf-text-sm">12-cabinet-follow</p>
      {USERS.map((u) => (
        <article key={u.name} className="wf-box wf-cabinet-follow" style={{ padding: 16, marginTop: 12 }}>
          <div className="wf-topnav__avatar wf-placeholder" style={{ width: 48, height: 48 }} />
          <div>
            <strong>{u.name}</strong>
            <p className="wf-text-sm">{u.meta}</p>
          </div>
        </article>
      ))}
    </WireframePage>
  );
}
