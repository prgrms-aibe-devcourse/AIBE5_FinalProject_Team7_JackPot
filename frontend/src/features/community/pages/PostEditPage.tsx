// 게시글 수정 페이지 — 기존 게시글 데이터를 불러와 폼에 초기화한 뒤 PATCH 요청으로 저장
import '../community.css';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { toast } from '@/shared/components/ui/Toast';
import { uploadImage } from '@/shared/api/mediaApi';
import { fetchAllWhiskeyCards, fetchWhiskeyById, type WhiskeyCard } from '@/features/search/api/whiskeyApi';
import { updatePost } from '../api/communityApi';
import { RichEditor } from '../components/RichEditor';
import { communityKeys, usePost } from '../hooks/useCommunity';
import type { PostCategory } from '../types';
import { POST_CATEGORY_LABEL } from '../types';

const CATEGORY_OPTIONS: Array<{ value: PostCategory; label: string }> = [
  { value: 'F', label: POST_CATEGORY_LABEL.F },
  { value: 'R', label: POST_CATEGORY_LABEL.R },
  { value: 'L', label: POST_CATEGORY_LABEL.L },
  { value: 'Q', label: POST_CATEGORY_LABEL.Q },
  { value: 'B', label: POST_CATEGORY_LABEL.B },
];

// PostFormPage에서 저장한 HTML 형식: <p style="...">텍스트</p><img ...><img ...>
// 수정 화면 진입 시 텍스트와 이미지를 분리해 각 UI에 복원
function parseFreeContent(context: string): { text: string; images: Array<{ name: string; url: string }> } {
  if (!context.startsWith('<')) return { text: context, images: [] };
  const doc = new DOMParser().parseFromString(context, 'text/html');
  const text = doc.querySelector('p')?.textContent ?? '';
  const images = Array.from(doc.querySelectorAll('img')).map((img) => ({
    name: img.alt || 'image',
    url: img.getAttribute('src') ?? '',
  }));
  return { text, images };
}

export default function PostEditPage() {
  const { postId } = useParams();
  const numericId = postId ? Number(postId) : undefined;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: post, isLoading, isError } = usePost(numericId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('F');
  const [submitting, setSubmitting] = useState(false);

  // 자유게시판 이미지 첨부
  const [attachedImages, setAttachedImages] = useState<Array<{ name: string; url: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const freeImageRef = useRef<HTMLInputElement>(null);

  // 위스키 검색은 칼럼 유형에서만 활성화
  const [whiskeyQuery, setWhiskeyQuery] = useState('');
  const [allWhiskeys, setAllWhiskeys] = useState<WhiskeyCard[]>([]);
  const [whiskeyResults, setWhiskeyResults] = useState<WhiskeyCard[]>([]);
  const [whiskeyDropdownOpen, setWhiskeyDropdownOpen] = useState(false);
  const [selectedWhiskeys, setSelectedWhiskeys] = useState<WhiskeyCard[]>([]);
  const [whiskeysLoading, setWhiskeysLoading] = useState(false);

  // post 로드 후 폼 초기화 — FREE 타입은 HTML을 파싱해 텍스트/이미지를 분리 복원
  useEffect(() => {
    if (!post) return;
    setTitle(post.title);
    setCategory(post.category);
    if (post.postType === 'FREE') {
      const { text, images } = parseFreeContent(post.context);
      setContent(text);
      setAttachedImages(images);
    } else {
      setContent(post.context);
    }
  }, [post]);

  // 기존에 연결된 whiskeyIds를 상세 정보로 변환해 selectedWhiskeys에 채움
  useEffect(() => {
    if (!post?.whiskeyIds?.length) return;
    Promise.all(post.whiskeyIds.map((id) => fetchWhiskeyById(id)))
      .then(setSelectedWhiskeys)
      .catch(() => {});
  }, [post?.whiskeyIds]);

  useEffect(() => {
    if (post?.postType !== 'COLUMN') return;

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
  }, [post?.postType]);

  useEffect(() => {
    if (post?.postType !== 'COLUMN') return;

    const q = whiskeyQuery.trim().toLowerCase();
    const filtered = q
      ? allWhiskeys.filter((w) => w.name.toLowerCase().includes(q))
      : allWhiskeys;
    setWhiskeyResults(filtered);
  }, [whiskeyQuery, allWhiskeys, post?.postType]);

  function selectWhiskey(whiskey: WhiskeyCard) {
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
    if (file.size > 5 * 1024 * 1024) { toast('이미지는 5MB 이하만 업로드 가능합니다.', 'warning'); return; }
    setUploading(true);
    try {
      const { mediaUrl } = await uploadImage(file, 'POST');
      setAttachedImages((prev) => [...prev, { name: file.name, url: mediaUrl }]);
    } catch {
      toast('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeAttachedImage(url: string) {
    setAttachedImages((prev) => prev.filter((img) => img.url !== url));
  }

  // 로딩/에러/권한 상태를 조기 반환으로 처리해 이후 로직의 null 가능성을 제거
  if (isLoading) return <WireframePage scroll><PageLoader label="불러오는 중…" /></WireframePage>;
  if (isError || !post) return <WireframePage scroll><p className="wf-text-sm">게시글을 불러오지 못했습니다.</p></WireframePage>;
  // isOwner 검사는 서버 응답 기준 — URL 직접 접근으로 타인의 게시글 수정 시도를 차단
  if (!post.isOwner) return <WireframePage scroll><p className="wf-text-sm">수정 권한이 없습니다.</p></WireframePage>;

  // postType은 서버에서 고정된 값이므로 수정 화면에서 변경 불가 — UI 분기만 사용
  const isColumn = post.postType === 'COLUMN';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    // PostFormPage와 동일한 방식으로 HTML 재조합 — 이미지가 있으면 텍스트를 <p>로 감싸고 img 태그를 뒤에 붙임
    const finalContent = !isColumn && attachedImages.length > 0
      ? `<p style="white-space:pre-wrap">${content}</p>` + attachedImages.map((img) => `<img src="${img.url}" alt="${img.name}" style="max-width:100%;margin:8px 0;">`).join('')
      : content;
    setSubmitting(true);
    try {
      const updated = await updatePost(post!.id, {
        title: title.trim(),
        context: finalContent,
        category,
        whiskeyIds: selectedWhiskeys.map((w) => w.id),
      });
      qc.setQueryData(communityKeys.post(post!.id), updated);
      navigate(`/community/posts/${post!.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WireframePage scroll>
      <button className="wf-chip wf-community-back-btn" onClick={() => navigate(-1)}>
        ← 뒤로
      </button>
      <h1 className="wf-title wf-post-form-title">게시글 수정</h1>

      <form onSubmit={handleSubmit} className="wf-post-form">
        {/* 칼럼 유형은 카테고리 개념이 없으므로 자유게시판일 때만 표시 */}
        {!isColumn && (
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

        {/* 칼럼: 위스키 검색
            onBlur + setTimeout(150ms)는 dropdown 항목 클릭 시 blur가 먼저 발생하는 문제를 방지 */}
        {isColumn && (
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
                    // onMouseDown: blur보다 먼저 실행되어 선택이 정상 동작
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

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          maxLength={200}
          className="wf-post-title-input"
        />

        {/* 수정 시에도 postType에 따라 에디터 종류를 구분 — 칼럼을 textarea로 수정하면 HTML 태그가 그대로 노출됨 */}
        {isColumn ? (
          <RichEditor value={content} onChange={setContent} />
        ) : (
          <>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={12}
              className="wf-post-textarea"
            />
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

        <button
          type="submit"
          className="wf-chip wf-chip--on wf-post-submit-btn"
          disabled={submitting || !title.trim() || !content.trim()}
        >
          {submitting ? '저장 중…' : '저장'}
        </button>
      </form>
    </WireframePage>
  );
}
