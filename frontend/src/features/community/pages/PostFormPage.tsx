// 게시글 작성 페이지 — URL 파라미터 ?type=으로 칼럼/자유게시판을 구분해 UI를 분기
import '../community.css';
import { useRef, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { uploadImage } from '@/shared/api/mediaApi';
import { fetchAllWhiskeyCards, type WhiskeyCard } from '@/features/search/api/whiskeyApi';
import { PATHS } from '@/app/router/paths';
import { isLoggedIn } from '@/shared/lib/authSession';
import { toast } from '@/shared/components/ui/Toast';
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
  const [allWhiskeys, setAllWhiskeys] = useState<WhiskeyCard[]>([]);
  const [whiskeyResults, setWhiskeyResults] = useState<WhiskeyCard[]>([]);
  const [whiskeyDropdownOpen, setWhiskeyDropdownOpen] = useState(false);
  const [selectedWhiskeys, setSelectedWhiskeys] = useState<WhiskeyCard[]>([]);
  const [whiskeysLoading, setWhiskeysLoading] = useState(false);

  // 이미지 첨부는 자유게시판 전용 — 칼럼은 RichEditor 내부에서 이미지 삽입 처리
  const [attachedImages, setAttachedImages] = useState<Array<{ name: string; url: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const freeImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (postType !== 'COLUMN') return;

    let cancelled = false;
    setWhiskeysLoading(true);
    fetchAllWhiskeyCards()
      .then((whiskeys) => {
        if (!cancelled) setAllWhiskeys(whiskeys);
      })
      .finally(() => {
        if (!cancelled) setWhiskeysLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postType]);

  useEffect(() => {
    if (postType !== 'COLUMN') return;

    const q = whiskeyQuery.trim().toLowerCase();
    const filtered = q
      ? allWhiskeys.filter((w) => w.name.toLowerCase().includes(q))
      : allWhiskeys;
    setWhiskeyResults(filtered);
  }, [whiskeyQuery, allWhiskeys, postType]);

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
    if (file.size > 5 * 1024 * 1024) { toast('이미지는 5MB 이하만 업로드 가능합니다.', 'warning'); return; }
    setUploading(true);
    try {
      const { mediaUrl } = await uploadImage(file, 'POST');
      setAttachedImages((prev) => [...prev, { name: file.name, url: mediaUrl }]);
    } catch {
      toast('이미지 업로드에 실패했습니다.', 'error');
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
    // 자유게시판에 이미지가 첨부된 경우 텍스트를 <p> 태그로 감싸 HTML로 저장
    // 텍스트만 있으면 항상 <로 시작하지 않아 PostDetailPage에서 plain text로 처리되어 img 태그가 그대로 노출되는 문제 방지
    const finalContent = postType === 'FREE' && attachedImages.length > 0
      ? `<p style="white-space:pre-wrap">${content}</p>` + attachedImages.map((img) => `<img src="${img.url}" alt="${img.name}" style="max-width:100%;margin:8px 0;">`).join('')
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
      <button className="wf-chip wf-community-back-btn" onClick={() => navigate(-1)}>
        ← 뒤로
      </button>
      <h1 className="wf-title wf-post-form-title">
        {TYPE_LABEL[postType] ?? postType} 글쓰기
      </h1>

      <form onSubmit={handleSubmit} className="wf-post-form">

        {/* 자유게시판: 카테고리 */}
        {postType === 'FREE' && (
          <div className="wf-post-categories">
            {CATEGORY_OPTIONS.map((opt) => (
              <button key={opt.value} type="button"
                className={`wf-chip wf-community-filter-btn${category === opt.value ? ' wf-chip--on' : ''}`}
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
            <p className="wf-text-sm wf-post-whiskey-label">관련 위스키 검색 (선택)</p>
            <div className="wf-post-whiskey-search">
              <input
                value={whiskeyQuery}
                onChange={(e) => setWhiskeyQuery(e.target.value)}
                onFocus={() => setWhiskeyDropdownOpen(true)}
                onBlur={() => setTimeout(() => setWhiskeyDropdownOpen(false), 150)}
                placeholder="위스키 이름으로 검색… (클릭하면 전체 목록 표시)"
                className="wf-post-whiskey-input"
              />
              {whiskeyDropdownOpen && (
                <ul className="wf-post-whiskey-dropdown">
                  {whiskeysLoading && (
                    <li className="wf-post-whiskey-dropdown-item wf-post-whiskey-dropdown-item--muted">불러오는 중…</li>
                  )}
                  {!whiskeysLoading && whiskeyResults.length === 0 && (
                    <li className="wf-post-whiskey-dropdown-item wf-post-whiskey-dropdown-item--muted">검색 결과가 없습니다.</li>
                  )}
                  {!whiskeysLoading && whiskeyResults.map((w) => (
                    // onMouseDown을 사용하는 이유: onClick은 onBlur 이후 실행되어 드롭다운이 먼저 닫힘
                    <li key={w.id} className="wf-post-whiskey-dropdown-item" onMouseDown={() => selectWhiskey(w)}>
                      <span>{w.name}</span>
                      {(w.region || w.country) && (
                        <span className="wf-post-whiskey-dropdown-region">{w.region ?? w.country}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selectedWhiskeys.length > 0 && (
              <div className="wf-post-selected-whiskeys">
                {selectedWhiskeys.map((w) => (
                  <span key={w.id} className="wf-chip wf-chip--on wf-chip--flex">
                    {w.name}
                    <button type="button" className="wf-chip-remove-btn" onClick={() => removeWhiskey(w.id)}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 제목 */}
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요" maxLength={200}
          className="wf-post-title-input" />

        {/* 본문: 칼럼은 RichEditor(WYSIWYG), 자유게시판은 단순 textarea + 이미지 첨부 */}
        {postType === 'COLUMN' ? (
          <RichEditor value={content} onChange={setContent} placeholder="칼럼 내용을 자유롭게 작성하세요. 이미지도 삽입할 수 있어요." />
        ) : (
          <>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요" rows={10}
              className="wf-post-textarea" />

            {/* 이미지 첨부 — input[file]을 숨기고 버튼 클릭으로 트리거 */}
            <div>
              <button type="button" className="wf-chip wf-post-image-btn"
                onClick={() => freeImageRef.current?.click()}
                disabled={uploading}>
                {uploading ? '업로드 중…' : '🖼 이미지 첨부'}
              </button>
              <input ref={freeImageRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                hidden onChange={handleFreeImageUpload} />
              {attachedImages.length > 0 && (
                <div className="wf-post-image-previews">
                  {attachedImages.map((img) => (
                    <div key={img.url} className="wf-post-image-item">
                      <img src={img.url} alt={img.name} className="wf-post-image-thumb" />
                      <button type="button" className="wf-post-image-remove" onClick={() => removeAttachedImage(img.url)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <button type="submit" className="wf-chip wf-chip--on wf-post-submit-btn"
          disabled={submitting || !title.trim() || !content.trim()}>
          {submitting ? '등록 중…' : '등록'}
        </button>
      </form>
    </WireframePage>
  );
}
