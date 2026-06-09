// 게시글 작성 페이지 — URL 파라미터 ?type=으로 칼럼/자유게시판을 구분해 UI를 분기
import { useRef, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { uploadImage } from '@/shared/api/mediaApi';
import { fetchWhiskeys, searchWhiskeys, type WhiskeyCard } from '@/features/search/api/whiskeyApi';
import { PATHS } from '@/app/router/paths';
import { isLoggedIn } from '@/shared/lib/authSession';
import { createPost } from '../api/communityApi';
import { RichEditor } from '../components/RichEditor';
import type { PostType, PostCategory } from '../types';
import { POST_CATEGORY_LABEL } from '../types';

// 글쓰기 버튼 레이블을 postType별로 매핑 — COLUMN/FREE 외 타입은 타입 코드 그대로 표시됨
const TYPE_LABEL: Partial<Record<PostType, string>> = {
  COLUMN: '칼럼',
  FREE: '자유게시판',
};

const CATEGORY_OPTIONS: Array<{ value: PostCategory; label: string }> = [
  { value: 'F', label: POST_CATEGORY_LABEL.F },
  { value: 'R', label: POST_CATEGORY_LABEL.R },
  { value: 'L', label: POST_CATEGORY_LABEL.L },
  { value: 'Q', label: POST_CATEGORY_LABEL.Q },
  { value: 'G', label: POST_CATEGORY_LABEL.G },
  { value: 'B', label: POST_CATEGORY_LABEL.B },
];

export default function PostFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // 쿼리 파라미터로 게시판 유형을 받아 처리 — URL 직접 접근 시 기본값은 FREE
  const postType = (searchParams.get('type') as PostType) ?? 'FREE';

  // 렌더링 전에 로그인 여부 확인 — 비로그인 접근을 빠르게 차단하기 위해 최상단에 배치
  if (!isLoggedIn()) {
    navigate(PATHS.LOGIN, { replace: true });
    return null;
  }

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('F');
  const [submitting, setSubmitting] = useState(false);

  // 위스키 검색은 칼럼 유형에서만 사용 — 자유게시판에서는 불필요한 상태
  const [whiskeyQuery, setWhiskeyQuery] = useState('');
  const [whiskeyResults, setWhiskeyResults] = useState<WhiskeyCard[]>([]);
  const [whiskeyDropdownOpen, setWhiskeyDropdownOpen] = useState(false);
  const [selectedWhiskeys, setSelectedWhiskeys] = useState<WhiskeyCard[]>([]);
  const [searching, setSearching] = useState(false);
  // 검색어 변경마다 API를 즉시 호출하면 요청이 폭증하므로 debounce 타이머로 제어
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 이미지 첨부는 자유게시판 전용 — 칼럼은 RichEditor 내부에서 이미지 삽입 처리
  const [attachedImages, setAttachedImages] = useState<Array<{ name: string; url: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const freeImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (postType !== 'COLUMN') return;
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (!whiskeyQuery.trim()) {
      // 검색어가 없을 때는 전체 목록을 빠르게(100ms) 보여줘 UX 개선
      searchTimer.current = setTimeout(async () => {
        setSearching(true);
        try {
          const result = await fetchWhiskeys({ size: 20 });
          setWhiskeyResults(result.content);
        } finally {
          setSearching(false);
        }
      }, 100);
      return;
    }

    // 검색어 입력 300ms 후에 API 호출 — 타이핑 중 불필요한 요청 억제
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const result = await searchWhiskeys({ q: whiskeyQuery.trim(), size: 20 });
        setWhiskeyResults(result.content);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [whiskeyQuery, postType]);

  function selectWhiskey(whiskey: WhiskeyCard) {
    // 동일 위스키를 중복 추가하지 않도록 ID 기준으로 중복 확인
    if (selectedWhiskeys.some((w) => w.id === whiskey.id)) return;
    setSelectedWhiskeys((prev) => [...prev, whiskey]);
    setWhiskeyQuery('');
    setWhiskeyDropdownOpen(false);
  }

  function removeWhiskey(id: number) {
    setSelectedWhiskeys((prev) => prev.filter((w) => w.id !== id));
  }

  async function handleFreeImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // 5MB 초과 시 서버에 부담을 주기 전에 클라이언트에서 먼저 차단
    if (file.size > 5 * 1024 * 1024) { alert('이미지는 5MB 이하만 업로드 가능합니다.'); return; }
    setUploading(true);
    try {
      const { mediaUrl } = await uploadImage(file, 'POST');
      setAttachedImages((prev) => [...prev, { name: file.name, url: mediaUrl }]);
    } catch {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      // 같은 파일을 다시 선택할 수 있도록 value 초기화
      e.target.value = '';
    }
  }

  function removeAttachedImage(url: string) {
    setAttachedImages((prev) => prev.filter((img) => img.url !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // 자유게시판 첨부 이미지를 별도 필드 대신 본문 HTML에 인라인으로 삽입
    // 칼럼은 RichEditor가 이미 HTML을 생성하므로 이 처리가 필요 없음
    const finalContent = postType === 'FREE' && attachedImages.length > 0
      ? content + attachedImages.map((img) => `<img src="${img.url}" alt="${img.name}" style="max-width:100%;margin:8px 0;">`).join('')
      : content;

    setSubmitting(true);
    try {
      const postId = await createPost({
        title: title.trim(),
        context: finalContent,
        postType,
        category,
        whiskeyIds: selectedWhiskeys.map((w) => w.id),
      });
      navigate(`/community/posts/${postId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WireframePage scroll>
      <button
        className="wf-chip"
        style={{ marginBottom: 16, cursor: 'pointer', border: 'none', background: 'none' }}
        onClick={() => navigate(-1)}
      >
        ← 뒤로
      </button>
      <h1 className="wf-title" style={{ marginBottom: 16 }}>
        {TYPE_LABEL[postType] ?? postType} 글쓰기
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* 자유게시판: 카테고리 */}
        {postType === 'FREE' && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORY_OPTIONS.map((opt) => (
              <button key={opt.value} type="button"
                className={`wf-chip${category === opt.value ? ' wf-chip--on' : ''}`}
                style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                onClick={() => setCategory(opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* 칼럼: 위스키 검색 드롭다운
            onBlur에서 setTimeout을 쓰는 이유: onBlur가 onMouseDown보다 먼저 발생해
            클릭 전 드롭다운이 닫히는 문제를 150ms 지연으로 방지 */}
        {postType === 'COLUMN' && (
          <div>
            <p className="wf-text-sm" style={{ marginBottom: 6, color: '#555' }}>관련 위스키 검색 (선택)</p>
            <div style={{ position: 'relative' }}>
              <input
                value={whiskeyQuery}
                onChange={(e) => setWhiskeyQuery(e.target.value)}
                onFocus={() => setWhiskeyDropdownOpen(true)}
                onBlur={() => setTimeout(() => setWhiskeyDropdownOpen(false), 150)}
                placeholder="위스키 이름으로 검색… (클릭하면 전체 목록 표시)"
                style={{ width: '100%', padding: 8, fontSize: 14, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
              {whiskeyDropdownOpen && (
                <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: 4, listStyle: 'none', margin: 0, padding: 0, zIndex: 10, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {searching && (
                    <li style={{ padding: '10px 12px', color: '#999', fontSize: 13 }}>검색 중…</li>
                  )}
                  {!searching && whiskeyResults.length === 0 && (
                    <li style={{ padding: '10px 12px', color: '#999', fontSize: 13 }}>검색 결과가 없습니다.</li>
                  )}
                  {!searching && whiskeyResults.map((w) => (
                    // onMouseDown을 사용하는 이유: onClick은 onBlur 이후 실행되어 드롭다운이 먼저 닫힘
                    <li key={w.id}
                      onMouseDown={() => selectWhiskey(w)}
                      style={{ padding: '10px 12px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{w.name}</span>
                      {(w.region || w.country) && (
                        <span style={{ color: '#aaa', fontSize: 12 }}>{w.region ?? w.country}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selectedWhiskeys.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {selectedWhiskeys.map((w) => (
                  <span key={w.id} className="wf-chip wf-chip--on" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {w.name}
                    <button type="button" onClick={() => removeWhiskey(w.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12, color: 'inherit' }}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 제목 */}
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요" maxLength={200}
          style={{ padding: 10, fontSize: 15, borderRadius: 4, border: '1px solid #ccc' }} />

        {/* 본문: 칼럼은 RichEditor(WYSIWYG), 자유게시판은 단순 textarea + 이미지 첨부 */}
        {postType === 'COLUMN' ? (
          <RichEditor value={content} onChange={setContent} placeholder="칼럼 내용을 자유롭게 작성하세요. 이미지도 삽입할 수 있어요." />
        ) : (
          <>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요" rows={10}
              style={{ padding: 10, fontSize: 14, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical' }} />

            {/* 이미지 첨부 — input[file]을 숨기고 버튼 클릭으로 트리거 */}
            <div>
              <button type="button" className="wf-chip"
                style={{ cursor: 'pointer', border: '1px solid #ccc', background: 'none' }}
                onClick={() => freeImageRef.current?.click()}
                disabled={uploading}>
                {uploading ? '업로드 중…' : '🖼 이미지 첨부'}
              </button>
              <input ref={freeImageRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: 'none' }} onChange={handleFreeImageUpload} />
              {attachedImages.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {attachedImages.map((img) => (
                    <div key={img.url} style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={img.url} alt={img.name}
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }} />
                      <button type="button" onClick={() => removeAttachedImage(img.url)}
                        style={{ position: 'absolute', top: -6, right: -6, background: '#333', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 11, cursor: 'pointer', lineHeight: '18px', padding: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <button type="submit" className="wf-chip wf-chip--on"
          style={{ cursor: 'pointer', border: 'none', alignSelf: 'flex-end', padding: '8px 24px' }}
          disabled={submitting || !title.trim() || !content.trim()}>
          {submitting ? '등록 중…' : '등록'}
        </button>
      </form>
    </WireframePage>
  );
}
