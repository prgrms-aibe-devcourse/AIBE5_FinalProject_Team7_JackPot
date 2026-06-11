import { useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { authApi } from '../api/authApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BIRTHDAY_REGEX = /^\d{8}$/;

function formatBirthday(raw: string): string {
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function validate(
  email: string,
  password: string,
  passwordChecked: boolean,
  nickname: string,
  birthday: string,
): string | null {
  if (!email) return '이메일을 입력해주세요.';
  if (!EMAIL_REGEX.test(email)) return '이메일 형식이 올바르지 않습니다.';
  if (!password) return '비밀번호를 입력해주세요.';
  if (password.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다.';
  if (!passwordChecked) return '비밀번호 확인을 완료해주세요.';
  if (!nickname) return '닉네임을 입력해주세요.';
  if (nickname.length < 2 || nickname.length > 20) return '닉네임은 2자 이상 20자 이하여야 합니다.';
  if (!birthday) return '생년월일을 입력해주세요.';
  if (!BIRTHDAY_REGEX.test(birthday)) return '생년월일 형식이 올바르지 않습니다. (예: 19900115)';
  return null;
}


export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthday, setBirthday] = useState('');
  const [loading, setLoading] = useState(false);

  // 이미 로그인된 상태면 라운지로 이동
  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate(PATHS.LOUNGE, { replace: true });
    }
  }, [navigate]);

  const handlePasswordChange = (v: string) => { setPassword(v); setPasswordChecked(false); };
  const handlePasswordConfirmChange = (v: string) => { setPasswordConfirm(v); setPasswordChecked(false); };

  const handlePasswordCheck = () => {
    if (!password || !passwordConfirm) { alert('비밀번호를 두 칸 모두 입력해주세요.'); return; }
    if (password === passwordConfirm) {
      setPasswordChecked(true);
      alert('비밀번호가 일치합니다.');
    } else {
      setPasswordChecked(false);
      alert('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
    }
  };

  const handleRegister = async () => {
    const errorMsg = validate(email, password, passwordChecked, nickname, birthday);
    if (errorMsg) { alert(errorMsg); return; }
    setLoading(true);
    try {
      const data = await authApi.register(email, password, nickname, formatBirthday(birthday), name || undefined);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userId', String(data.userId));
      localStorage.setItem('nickname', data.nickname);
      localStorage.setItem('profileImageUrl', data.profileImageUrl ?? '');
      localStorage.setItem('role', data.role ?? 'USER');
      navigate(data.isNewUser ? PATHS.ONBOARDING : PATHS.LOUNGE);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNav searchPlaceholder="Whiskey Note" />
      <div className="wf-page wf-guest-center">
        <div className="wf-auth-box wf-box wf-box--solid wf-register-box">

          {/* 헤더 */}
          <div className="wf-register-header">
            <div className="wf-register-emoji">🥃</div>
            <h2 className="wf-title wf-auth-title wf-register-title">회원가입</h2>
            <p className="wf-subtitle">취향 설문 후 맞춤 위스키를 추천받아보세요</p>
          </div>

          {/* 구분선 */}
          <div className="wf-register-divider" />

          {/* 이메일 */}
          <div className="wf-register-field-group">
            <label className="wf-register-label">이메일 <span className="wf-register-required">*</span></label>
            <input
              className="wf-register-field"
              placeholder="whiskey@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* 비밀번호 */}
          <div className="wf-register-field-group--sm">
            <label className="wf-register-label">비밀번호 <span className="wf-register-required">*</span></label>
            <input
              className="wf-register-field"
              type="password"
              placeholder="8자 이상 입력"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </div>

          {/* 비밀번호 확인 + 확인 버튼 */}
          <div className="wf-register-field-group">
            <label className="wf-register-label">비밀번호 확인 <span className="wf-register-required">*</span></label>
            <div className="wf-register-pwd-row">
              <input
                className="wf-register-field wf-register-field--flex"
                type="password"
                placeholder="비밀번호 재입력"
                value={passwordConfirm}
                onChange={(e) => handlePasswordConfirmChange(e.target.value)}
              />
              <button
                type="button"
                onClick={handlePasswordCheck}
                className={`wf-register-pwd-check-btn${passwordChecked ? ' wf-register-pwd-check-btn--checked' : ''}`}
              >
                {passwordChecked ? '✓ 일치' : '확인'}
              </button>
            </div>
          </div>

          {/* 이름 (선택) + 닉네임 나란히 */}
          <div className="wf-register-grid2">
            <div>
              <label className="wf-register-label">이름 <span className="wf-register-optional">(선택)</span></label>
              <input
                className="wf-register-field"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="wf-register-label">닉네임 <span className="wf-register-required">*</span></label>
              <input
                className="wf-register-field"
                placeholder="2~20자"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>

          {/* 생년월일 */}
          <div className="wf-register-field-group--last">
            <label className="wf-register-label">생년월일 <span className="wf-register-required">*</span></label>
            <input
              className="wf-register-field"
              placeholder="예: 19900115"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              maxLength={8}
            />
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="wf-register-submit"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>

          {/* 로그인 링크 */}
          <p className="wf-text-xs wf-register-footer">
            이미 계정이 있으신가요?{' '}
            <Link to={PATHS.LOGIN} className="wf-register-login-link">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
