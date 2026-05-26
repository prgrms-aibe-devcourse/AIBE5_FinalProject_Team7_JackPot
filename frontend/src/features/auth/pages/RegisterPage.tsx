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

const fieldStyle: React.CSSProperties = {
  width: '100%',
  height: 48,
  background: 'var(--wf-surface-2)',
  border: '1px solid var(--wf-border)',
  borderRadius: 10,
  padding: '0 14px',
  fontSize: 14,
  color: 'var(--wf-text)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--wf-muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  marginBottom: 6,
  display: 'block',
};

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
        <div className="wf-auth-box wf-box wf-box--solid" style={{ maxWidth: 440 }}>

          {/* 헤더 */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🥃</div>
            <h2 className="wf-title" style={{ fontSize: 22, marginBottom: 6 }}>회원가입</h2>
            <p className="wf-subtitle">취향 설문 후 맞춤 위스키를 추천받아보세요</p>
          </div>

          {/* 구분선 */}
          <div style={{ height: 1, background: 'var(--wf-border)', marginBottom: 24 }} />

          {/* 이메일 */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>이메일 <span style={{ color: 'var(--wf-accent)' }}>*</span></label>
            <input
              style={fieldStyle}
              placeholder="whiskey@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* 비밀번호 */}
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>비밀번호 <span style={{ color: 'var(--wf-accent)' }}>*</span></label>
            <input
              style={fieldStyle}
              type="password"
              placeholder="8자 이상 입력"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </div>

          {/* 비밀번호 확인 + 확인 버튼 */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>비밀번호 확인 <span style={{ color: 'var(--wf-accent)' }}>*</span></label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...fieldStyle, flex: 1 }}
                type="password"
                placeholder="비밀번호 재입력"
                value={passwordConfirm}
                onChange={(e) => handlePasswordConfirmChange(e.target.value)}
              />
              <button
                type="button"
                onClick={handlePasswordCheck}
                style={{
                  height: 48,
                  padding: '0 16px',
                  borderRadius: 10,
                  border: `1px solid ${passwordChecked ? 'var(--wf-success)' : 'var(--wf-accent)'}`,
                  background: passwordChecked ? 'rgba(74, 222, 128, 0.12)' : 'var(--wf-accent-dim)',
                  color: passwordChecked ? 'var(--wf-success)' : 'var(--wf-accent)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                {passwordChecked ? '✓ 일치' : '확인'}
              </button>
            </div>
          </div>

          {/* 이름 (선택) + 닉네임 나란히 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>이름 <span style={{ color: 'var(--wf-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(선택)</span></label>
              <input
                style={fieldStyle}
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>닉네임 <span style={{ color: 'var(--wf-accent)' }}>*</span></label>
              <input
                style={fieldStyle}
                placeholder="2~20자"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>

          {/* 생년월일 */}
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>생년월일 <span style={{ color: 'var(--wf-accent)' }}>*</span></label>
            <input
              style={fieldStyle}
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
            style={{
              width: '100%',
              height: 50,
              borderRadius: 12,
              border: 'none',
              background: loading ? 'var(--wf-border)' : 'var(--wf-accent)',
              color: loading ? 'var(--wf-muted)' : '#0c0c0f',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>

          {/* 로그인 링크 */}
          <p className="wf-text-xs" style={{ textAlign: 'center', marginTop: 18, color: 'var(--wf-muted)' }}>
            이미 계정이 있으신가요?{' '}
            <Link to={PATHS.LOGIN} style={{ color: 'var(--wf-accent)', fontWeight: 600, textDecoration: 'none' }}>
              로그인
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
