import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { uploadImage } from '@/shared/api/mediaApi';
import { PROFILE_UPDATED_EVENT } from '@/shared/components/layout/TopNav';
import { clearAuthSession } from '@/shared/lib/authSession';
import { resolveProfileImageUrl } from '@/shared/lib/mediaUrl';
import { toast } from '@/shared/components/ui/Toast';
import { confirmToast } from '@/shared/components/ui/ConfirmToast';
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
  const [introduction, setIntroduction] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  // USER-01: 프로필 조회
  // 의도: 진입 시 서버 프로필 로드 + TopNav용 localStorage 갱신
  useEffect(() => {
    const run = async () => {
      try {
        const data = await userApi.getMe();
        setMe(data);
        setNickname(data.nickname ?? '');
        setIntroduction(data.introduction ?? '');
        localStorage.setItem('nickname', data.nickname ?? '');
        localStorage.setItem('profileImageUrl', data.profileImageUrl ?? '');
        if (data.introduction !== undefined) {
          localStorage.setItem('profileIntroduction', data.introduction ?? '');
        }
        window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
      } catch {
        // MVP: 오류 시에도 페이지는 렌더링(로그인은 TopNav에서 처리)
        toast('프로필을 불러오지 못했습니다.', 'error');
      }
    };
    run();
  }, []);

  // USER-02: 닉네임·소개 저장
  async function handleSaveProfile() {
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      toast('닉네임을 입력해주세요.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const body: UpdateUserMeRequest = {
        nickname: trimmedNickname,
        introduction: introduction.trim(),
      };
      const updated = await userApi.updateMe(body);
      setMe(updated);
      setNickname(updated.nickname);
      const savedIntroduction =
        updated.introduction !== undefined ? (updated.introduction ?? '') : introduction.trim();
      setIntroduction(savedIntroduction);
      localStorage.setItem('nickname', updated.nickname);
      localStorage.setItem('profileImageUrl', updated.profileImageUrl ?? '');
      localStorage.setItem('profileIntroduction', savedIntroduction);
      window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
      toast('프로필을 저장했습니다.', 'success');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : '저장에 실패했습니다.', 'error');
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
      toast('JPEG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.', 'warning');
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
      toast(err instanceof Error ? err.message : '프로필 이미지 업로드에 실패했습니다.', 'error');
    } finally {
      setUploadingImage(false);
    }
  }

  // USER-04: 탈퇴
  // 의도: 탈퇴 API 후 세션 삭제하고 로그인 화면으로
  async function handleWithdraw() {
    if (withdrawing) return;
    const ok = await confirmToast({
      message: '정말로 탈퇴하시겠습니까? 탈퇴 후에는 되돌릴 수 없습니다.',
      danger: true,
    });
    if (!ok) return;

    setWithdrawing(true);
    try {
      await userApi.deleteMe();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : '탈퇴에 실패했습니다.', 'error');
      setWithdrawing(false);
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
      toast('현재 비밀번호와 새 비밀번호를 입력해주세요.', 'warning');
      return;
    }
    if (newPassword.trim().length < 8) {
      toast('새 비밀번호는 최소 8자 이상이어야 합니다.', 'warning');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast('새 비밀번호 확인이 일치하지 않습니다.', 'warning');
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
      setPasswordModalOpen(false);
      toast('비밀번호가 변경되었습니다.', 'success');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : '비밀번호 변경에 실패했습니다.', 'error');
    } finally {
      setSavingPassword(false);
    }
  }

  const avatarSrc = resolveProfileImageUrl(me?.profileImageUrl ?? null, me?.userId ?? me?.nickname);

  return (
    <WireframePage scroll>
      <div className="wf-mypage-page">
        <header className="wf-mypage-intro">
          <p className="wf-mypage-intro__eyebrow">마이페이지</p>
          <p className="wf-mypage-intro__subtitle">프로필과 계정 설정을 관리합니다.</p>
        </header>

        <section className="wf-mypage-hero" aria-label="내 계정 요약">
          <div className="wf-mypage-hero__profile">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="wf-mypage-avatar-btn"
              aria-label="프로필 사진 변경"
            >
              <div className="wf-mypage-avatar">
                <img src={avatarSrc} alt={me?.nickname ?? ''} />
              </div>
              <span className="wf-mypage-avatar__overlay">
                {uploadingImage ? '업로드 중' : '사진 변경'}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_IMAGE}
              hidden
              onChange={handleProfileImageChange}
            />

            <div className="wf-mypage-identity">
              <h1 className="wf-mypage-name">{me?.nickname ?? '프로필'}</h1>
              <p className="wf-mypage-email">{me?.email ?? '로그인 후 프로필을 불러옵니다.'}</p>
            </div>
          </div>

          <Button variant="ghost" to={PATHS.CABINET} className="wf-mypage-hero__link">
            내 캐비넷 보기
          </Button>
        </section>

        <div className="wf-mypage-grid">
          <section className="wf-mypage-card wf-mypage-card--primary" aria-labelledby="profile-edit-title">
            <div className="wf-mypage-card__header">
              <div>
                <p className="wf-mypage-kicker">프로필</p>
                <h2 id="profile-edit-title">프로필 수정</h2>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="wf-mypage-btn--cta"
                disabled={saving}
                onClick={handleSaveProfile}
              >
                {saving ? '저장 중...' : '저장'}
              </Button>
            </div>
            <div className="wf-mypage-form">
              <Input
                label="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                disabled={saving}
              />
              <label className="wf-mypage-intro-label" htmlFor="profile-introduction">
                <span className="wf-text-label">소개</span>
                <textarea
                  id="profile-introduction"
                  className="wf-mypage-textarea"
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  placeholder="소개"
                  maxLength={500}
                  rows={1}
                  disabled={saving}
                />
              </label>
            </div>
          </section>

          <section className="wf-mypage-card wf-mypage-card--actions" aria-labelledby="quick-actions-title">
            <div className="wf-mypage-card__header">
              <h2 id="quick-actions-title">바로가기</h2>
            </div>

            <button
              className="wf-mypage-action-row"
              onClick={() => navigate(PATHS.SURVEY)}
              type="button"
            >
              <span>
                <strong>취향 설문 다시하기</strong>
                <small>추천 결과를 새 취향에 맞게 갱신합니다.</small>
              </span>
              <span aria-hidden="true">›</span>
            </button>

            <button
              className="wf-mypage-action-row"
              onClick={() => navigate(PATHS.WHISKEY_REQUEST)}
              type="button"
            >
              <span>
                <strong>위스키 등록 요청</strong>
                <small>찾을 수 없는 위스키를 운영팀에 제안합니다.</small>
              </span>
              <span aria-hidden="true">›</span>
            </button>
          </section>

          <section className="wf-mypage-card wf-mypage-card--compact" aria-labelledby="password-title">
            <div className="wf-mypage-card__header">
              <div>
                <p className="wf-mypage-kicker">보안</p>
                <h2 id="password-title">비밀번호 변경</h2>
              </div>
            </div>
            <div className="wf-mypage-compact-row">
              <div>
                <strong>로그인 비밀번호</strong>
                <p>현재 비밀번호 확인 후 새 비밀번호로 변경합니다.</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="wf-mypage-action-button"
                onClick={() => setPasswordModalOpen(true)}
              >
                변경
              </Button>
            </div>
          </section>

          <section className="wf-mypage-card wf-mypage-card--danger" aria-labelledby="account-title">
            <div className="wf-mypage-card__header">
              <div>
                <p className="wf-mypage-kicker">계정</p>
                <h2 id="account-title">회원 관리</h2>
              </div>
            </div>
            <div className="wf-mypage-danger-row">
              <div>
                <strong>회원 탈퇴</strong>
                <p>탈퇴하면 계정 복구가 어렵습니다.</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                className="wf-mypage-action-button wf-mypage-action-button--danger"
                disabled={withdrawing}
                onClick={handleWithdraw}
              >
                {withdrawing ? '처리 중' : '탈퇴'}
              </Button>
            </div>
          </section>
        </div>
      </div>

      {passwordModalOpen ? (
        <div
          className="wf-mypage-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-modal-title"
        >
          <div className="wf-mypage-modal__backdrop" onClick={() => setPasswordModalOpen(false)} />
          <section className="wf-mypage-modal__panel">
            <div className="wf-mypage-modal__header">
              <div>
                <p className="wf-mypage-kicker">보안</p>
                <h2 id="password-modal-title">비밀번호 변경</h2>
              </div>
              <button
                type="button"
                className="wf-mypage-modal__close"
                onClick={() => setPasswordModalOpen(false)}
                aria-label="비밀번호 변경 닫기"
              >
                ×
              </button>
            </div>
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
              <div className="wf-mypage-modal__actions">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPasswordModalOpen(false)}
                  disabled={savingPassword}
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="wf-mypage-action-button wf-mypage-btn--cta"
                  disabled={savingPassword}
                  onClick={handleChangePassword}
                >
                  {savingPassword ? '변경 중...' : '변경하기'}
                </Button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </WireframePage>
  );
}
