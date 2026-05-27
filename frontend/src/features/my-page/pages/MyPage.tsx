import { useEffect, useState } from 'react';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { userApi, type UserMeDto, type UpdateUserMeRequest } from '../api/userApi';

export default function MyPage() {
  const [me, setMe] = useState<UserMeDto | null>(null);
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await userApi.getMe();
        setMe(data);
        setNickname(data.nickname ?? '');
      } catch {
        // MVP: 오류 시에도 페이지는 렌더링(로그인은 TopNav에서 처리)
      }
    };
    run();
  }, []);

  async function handleSave() {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const body: UpdateUserMeRequest = { nickname: trimmed };
      const updated = await userApi.updateMe(body);
      setMe(updated);
      localStorage.setItem('nickname', updated.nickname);
      localStorage.setItem('profileImageUrl', updated.profileImageUrl ?? '');
    } finally {
      setSaving(false);
    }
  }

  const avatarSrc = resolveMediaUrl(me?.profileImageUrl ?? null);

  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">홈 / <strong>마이페이지</strong></p>
      <div className="wf-box wf-panel" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div
          className="wf-topnav__avatar wf-placeholder"
          style={{ width: 64, height: 64, overflow: 'hidden', borderRadius: '50%', border: '1px solid var(--wf-border)' }}
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt={me?.nickname ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : null}
        </div>
        <div>
          <h1 className="wf-title" style={{ fontSize: 20 }}>
            {me?.nickname ?? 'GlassOfWhisky'}
          </h1>
          <p className="wf-text-sm">{me?.email ? `${me.email}` : '입문자 · 팔로워 12 · 팔로잉 8'}</p>
        </div>
      </div>
      <p className="wf-section-title">설정</p>
      <div className="wf-box" style={{ padding: 14 }}>
        <p className="wf-text-sm" style={{ marginBottom: 10 }}>프로필 수정</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Input
            label="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
          />
          <Button
            variant="primary"
            block
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
      <div className="wf-box" style={{ padding: 14, marginTop: 8 }}>
        취향 설문 다시하기
      </div>
      <Button variant="ghost" to={PATHS.CABINET} style={{ marginTop: 16 }}>
        캐비넷으로 이동
      </Button>
    </WireframePage>
  );
}
