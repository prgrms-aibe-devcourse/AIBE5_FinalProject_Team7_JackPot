import { useNavigate } from 'react-router-dom';
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
import '../my-page.css';

/**
 * 마이페이지 화면
 * - USER-01: userApi.getMe — 프로필 조회
 * - USER-02: userApi.updateMe — 닉네임·프로필 이미지(S3 key)
 * - SET-01: userApi.updateMyPassword — 비밀번호 변경
 * - USER-04: userApi.deleteMe + clearAuthSession — 탈퇴
 */
const ACCEPT_IMAGE = 'image/jpeg,image/png,image/webp,image/gif';

export default function MyPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [me, setMe] = useState<UserMeDto | null>(null);
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // USER-01: 프로필 조회
  // 의도: 진입 시 서버 프로필 로드 + TopNav용 localStorage 갱신
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

  // USER-02: 닉네임 저장
  // 의도: 닉네임만 저장 (프로필 이미지는 별도 핸들러)
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

  // USER-02: 프로필 이미지 저장
  // 의도: presign 업로드 후 object key만 DB에 저장 (URL 직접 저장 X)
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

  // USER-04: 탈퇴
  // 의도: 탈퇴 API 후 세션 삭제하고 로그인 화면으로
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

  // SET-01: 비밀번호 변경
  // 의도: 프론트 검증 후 LOCAL 비밀번호 변경 API 호출
  async function handleChangePassword() {
    if (savingPassword) return;
    if (!currentPassword.trim() || !newPassword.trim()) {
      alert('현재 비밀번호와 새 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword.trim().length < 8) {
      alert('새 비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      alert('새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setSavingPassword(true);
    try {
      await userApi.updateMyPassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      alert('비밀번호가 변경되었습니다.');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setSavingPassword(false);
    }
  }

  const avatarSrc = resolveMediaUrl(me?.profileImageUrl ?? null);

  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">홈 / <strong>마이페이지</strong></p>
      <div className="wf-box wf-panel wf-mypage-profile-panel">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="wf-mypage-avatar-btn"
          aria-label="프로필 사진 변경"
        >
          <div className="wf-mypage-avatar">
            {avatarSrc ? (
              <img src={avatarSrc} alt={me?.nickname ?? ''} />
            ) : (
              <span className="wf-mypage-avatar__emoji">🥃</span>
            )}
          </div>
          <span className="wf-mypage-avatar__overlay">
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
          <h1 className="wf-title wf-mypage-name">{me?.nickname ?? '—'}</h1>
          <p className="wf-text-sm">{me?.email ?? '로그인 후 프로필을 불러옵니다.'}</p>
        </div>
      </div>
      <p className="wf-section-title">설정</p>
      <div className="wf-box wf-mypage-settings-box">
        <p className="wf-text-sm wf-mypage-settings-box__label">프로필 수정</p>
        <div className="wf-mypage-form">
          <Input
            label="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
          />
          <Button variant="primary" block disabled={saving} onClick={handleSave}>
            {saving ? '저장 중...' : '닉네임 저장'}
          </Button>
        </div>
      </div>
      <div
        className="wf-box wf-mypage-nav-item"
        onClick={() => navigate(PATHS.SURVEY)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate(PATHS.SURVEY)}
      >
        <div className="wf-mypage-nav-item__row">
          <p className="wf-mypage-nav-item__label">취향 설문 다시하기</p>
          <span className="wf-mypage-nav-item__arrow">›</span>
        </div>
      </div>
      <div
        className="wf-box wf-mypage-nav-item"
        onClick={() => navigate('/whiskey-requests')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/whiskey-requests')}
      >
        <div className="wf-mypage-nav-item__row">
          <p className="wf-mypage-nav-item__label">위스키 등록 요청</p>
          <span className="wf-mypage-nav-item__arrow">›</span>
        </div>
      </div>
      <div className="wf-box wf-mypage-settings-box">
        <p className="wf-text-sm wf-mypage-settings-box__label">비밀번호 변경</p>
        <div className="wf-mypage-form">
          <Input
            label="현재 비밀번호"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호"
          />
          <Input
            label="새 비밀번호"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호 (8자 이상)"
          />
          <Input
            label="새 비밀번호 확인"
            type="password"
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            placeholder="새 비밀번호 확인"
          />
          <Button variant="primary" block disabled={savingPassword} onClick={handleChangePassword}>
            {savingPassword ? '변경 중...' : '비밀번호 변경'}
          </Button>
        </div>
      </div>
      <div className="wf-box wf-mypage-settings-box">
        <p className="wf-text-sm wf-mypage-settings-box__label">회원</p>
        <Button variant="danger" block onClick={handleWithdraw}>
          회원 탈퇴
        </Button>
      </div>
      <Button variant="ghost" to={PATHS.CABINET} className="wf-mypage-cabinet-link">
        캐비넷으로 이동
      </Button>
    </WireframePage>
  );
}
