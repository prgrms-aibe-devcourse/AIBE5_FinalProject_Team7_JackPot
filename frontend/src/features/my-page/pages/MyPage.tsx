import { useEffect, useRef, useState } from 'react';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { uploadImage } from '@/shared/api/mediaApi';
import { PROFILE_UPDATED_EVENT } from '@/shared/components/layout/TopNav';
import { clearAuthSession } from '@/shared/lib/authSession';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { userApi, type UserMeDto, type UpdateUserMeRequest } from '../api/userApi';

const ACCEPT_IMAGE = 'image/jpeg,image/png,image/webp,image/gif';

export default function MyPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [me, setMe] = useState<UserMeDto | null>(null);
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await userApi.getMe();
        setMe(data);
        setNickname(data.nickname ?? '');
        localStorage.setItem('nickname', data.nickname ?? '');
        localStorage.setItem('profileImageUrl', data.profileImageUrl ?? '');
        window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
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
      setNickname(updated.nickname);
      localStorage.setItem('nickname', updated.nickname);
      localStorage.setItem('profileImageUrl', updated.profileImageUrl ?? '');
      window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleProfileImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ACCEPT_IMAGE.split(',').includes(file.type)) {
      alert('JPEG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.');
      return;
    }

    setUploadingImage(true);
    try {
      const presign = await uploadImage(file, 'PROFILE');
      const updated = await userApi.updateMe({ profileImageUrl: presign.objectKey });
      setMe(updated);
      localStorage.setItem('profileImageUrl', updated.profileImageUrl ?? '');
      window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '프로필 이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleWithdraw() {
    const ok = window.confirm('정말로 탈퇴하시겠습니까? 탈퇴 후에는 되돌릴 수 없습니다.');
    if (!ok) return;

    try {
      await userApi.deleteMe();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '탈퇴에 실패했습니다.');
      return;
    }

    clearAuthSession();
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
    window.location.href = PATHS.LOGIN;
  }

  const avatarSrc = resolveMediaUrl(me?.profileImageUrl ?? null);

  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">홈 / <strong>마이페이지</strong></p>
      <div className="wf-box wf-panel" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          style={{
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: uploadingImage ? 'wait' : 'pointer',
            position: 'relative',
          }}
          aria-label="프로필 사진 변경"
        >
          <div
            className="wf-topnav__avatar wf-placeholder"
            style={{ width: 64, height: 64, overflow: 'hidden', borderRadius: '50%', border: '1px solid var(--wf-border)' }}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt={me?.nickname ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 28 }}>🥃</span>
            )}
          </div>
          <span
            className="wf-text-xs"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0,0,0,0.55)',
              color: '#fff',
              padding: '2px 0',
              textAlign: 'center',
            }}
          >
            {uploadingImage ? '업로드…' : '변경'}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_IMAGE}
          hidden
          onChange={handleProfileImageChange}
        />
        <div>
          <h1 className="wf-title" style={{ fontSize: 20 }}>
            {me?.nickname ?? '—'}
          </h1>
          <p className="wf-text-sm">{me?.email ?? '로그인 후 프로필을 불러옵니다.'}</p>
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
            {saving ? '저장 중...' : '닉네임 저장'}
          </Button>
        </div>
      </div>
      <div className="wf-box" style={{ padding: 14, marginTop: 8 }}>
        취향 설문 다시하기
      </div>
      <div className="wf-box" style={{ padding: 14, marginTop: 8 }}>
        <p className="wf-text-sm" style={{ marginBottom: 10 }}>회원</p>
        <Button variant="ghost" block onClick={handleWithdraw} style={{ border: '1px solid #ff4d4f', color: '#ff4d4f' }}>
          회원 탈퇴
        </Button>
      </div>
      <Button variant="ghost" to={PATHS.CABINET} style={{ marginTop: 16 }}>
        캐비넷으로 이동
      </Button>
    </WireframePage>
  );
}
