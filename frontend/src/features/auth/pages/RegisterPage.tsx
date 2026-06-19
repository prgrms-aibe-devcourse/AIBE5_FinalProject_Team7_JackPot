import { useState, useRef } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { toast } from '@/shared/components/ui/Toast';
import { Button } from '@/shared/components/ui/Button';
import { authApi } from '../api/authApi';
import '../auth.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BIRTHDAY_REGEX = /^\d{8}$/;

// YYYYMMDD 형식 문자열을 YYYY-MM-DD 로 변환
function formatBirthday(raw: string): string {
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

// 2번: YYYYMMDD 형식의 날짜가 실제로 유효한지 검증
// ex) 20261399 → false (13월, 99일)
function isValidDate(raw: string): boolean {
  if (!BIRTHDAY_REGEX.test(raw)) return false;
  const year  = Number(raw.slice(0, 4));
  const month = Number(raw.slice(4, 6));
  const day   = Number(raw.slice(6, 8));
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  // Date 객체로 실제 존재 여부 체크 (ex: 2월 30일)
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// 미래 날짜 여부 체크
function isFutureDate(raw: string): boolean {
  const formatted = formatBirthday(raw);
  return new Date(formatted) > new Date();
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
  if (!BIRTHDAY_REGEX.test(birthday)) return '생년월일 8자리를 입력해주세요. (예: 19900115)';
  // 2번: 유효하지 않은 날짜 차단
  if (!isValidDate(birthday)) return '존재하지 않는 날짜입니다. 다시 확인해주세요.';
  if (isFutureDate(birthday)) return '생년월일은 오늘 이후 날짜를 입력할 수 없습니다.';
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
  const [birthday, setBirthday] = useState('');       // YYYYMMDD 형식
  const [birthdayError, setBirthdayError] = useState('');  // 실시간 에러 메시지
  const [loading, setLoading] = useState(false);

  // 캘린더 date input ref — 버튼 클릭 시 .showPicker() 호출
  const calendarRef = useRef<HTMLInputElement>(null);

  // 이미 로그인된 상태면 라운지로 이동
  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate(PATHS.LOUNGE, { replace: true });
    }
  }, [navigate]);

  const handlePasswordChange = (v: string) => { setPassword(v); setPasswordChecked(false); };
  const handlePasswordConfirmChange = (v: string) => { setPasswordConfirm(v); setPasswordChecked(false); };

  const handlePasswordCheck = () => {
    if (!password || !passwordConfirm) { toast('비밀번호를 두 칸 모두 입력해주세요.', 'warning'); return; }
    if (password === passwordConfirm) {
      setPasswordChecked(true);
      toast('비밀번호가 일치합니다.', 'success');
    } else {
      setPasswordChecked(false);
      toast('비밀번호가 일치하지 않습니다. 다시 확인해주세요.', 'error');
    }
  };

  // 2번: 직접 입력 핸들러 — 숫자만 허용, 실시간 유효성 검사
  const handleBirthdayTextChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 8);
    setBirthday(digits);
    if (digits.length === 8) {
      if (!isValidDate(digits)) {
        setBirthdayError('존재하지 않는 날짜입니다.');
      } else if (isFutureDate(digits)) {
        setBirthdayError('오늘 이후 날짜는 입력할 수 없습니다.');
      } else {
        setBirthdayError('');
      }
    } else {
      setBirthdayError('');
    }
  };

  // 3번: 캘린더(date input)에서 선택 핸들러 — YYYY-MM-DD → YYYYMMDD 변환
  const handleBirthdayCalendarChange = (v: string) => {
    // v = "YYYY-MM-DD"
    const digits = v.replace(/-/g, '');
    setBirthday(digits);
    setBirthdayError('');
  };

  // 캘린더에 표시할 값 (YYYY-MM-DD 형식으로 역변환)
  const calendarValue = birthday.length === 8 ? formatBirthday(birthday) : '';

  const handleRegister = async () => {
    const errorMsg = validate(email, password, passwordChecked, nickname, birthday);
    if (errorMsg) { toast(errorMsg, 'warning'); return; }
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
      toast(e instanceof Error ? e.message : '회원가입에 실패했습니다.', 'error');
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
          <header className="wf-register-header">
            <p className="wf-auth-intro__eyebrow">시작하기</p>
            <h2 className="wf-title wf-auth-title wf-register-title">회원가입</h2>
            <p className="wf-subtitle wf-auth-intro__subtitle">취향 설문 후 맞춤 위스키를 추천받아보세요</p>
          </header>

          {/* 구분선 */}
          <div className="wf-register-divider" />

          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>

            {/* 이메일 */}
            <div className="wf-register-field-group">
              <label className="wf-register-label">이메일 <span className="wf-register-required">*</span></label>
              <input
                className="wf-register-field"
                placeholder="whiskey@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
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
                disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div>
                <label className="wf-register-label">닉네임 <span className="wf-register-required">*</span></label>
                <input
                  className="wf-register-field"
                  placeholder="2~20자"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* 생년월일 — 직접 입력 + 캘린더 선택 */}
            <div className="wf-register-field-group--last">
              <label className="wf-register-label">
                생년월일 <span className="wf-register-required">*</span>
              </label>
              <div className="wf-register-birthday-row">
                <input
                  className="wf-register-field wf-register-birthday-field"
                  placeholder="예: 19900115"
                  value={birthday}
                  onChange={(e) => handleBirthdayTextChange(e.target.value)}
                  maxLength={8}
                  inputMode="numeric"
                  disabled={loading}
                />
                <div className="wf-register-calendar-wrap">
                  <input
                    ref={calendarRef}
                    type="date"
                    className="wf-register-calendar-input"
                    value={calendarValue}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleBirthdayCalendarChange(e.target.value)}
                    tabIndex={-1}
                    aria-hidden
                  />
                  <button
                    type="button"
                    className="wf-register-calendar-btn"
                    onClick={() => calendarRef.current?.showPicker()}
                    title="캘린더에서 날짜 선택"
                    aria-label="캘린더에서 날짜 선택"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </button>
                </div>
              </div>
              {birthdayError ? (
                <p className="wf-register-field-error" role="alert">{birthdayError}</p>
              ) : null}
              <p className="wf-register-field-hint">
                8자리 직접 입력 또는 달력 버튼으로 날짜를 선택하세요.
              </p>
            </div>

            {/* 회원가입 버튼 — 로그인 버튼과 동일 스타일 */}
            <Button type="submit" block disabled={loading} className="wf-auth-submit">
              {loading ? '가입 중...' : '회원가입'}
            </Button>
          </form>

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
