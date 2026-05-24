import { WireframePage } from '@/shared/components/layout/WireframePage';

export default function AdminPage() {
  return (
    <WireframePage scroll>
      <h1 className="wf-title">Admin</h1>
      <p className="wf-text-sm">운영 · 신고 · 위스키 등록 요청</p>
      <div className="wf-box" style={{ padding: 16, marginTop: 16 }}>대기 중 등록 요청 3건</div>
      <div className="wf-box" style={{ padding: 16, marginTop: 8 }}>미처리 신고 1건</div>
    </WireframePage>
  );
}
