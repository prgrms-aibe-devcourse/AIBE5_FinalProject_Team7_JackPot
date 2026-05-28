import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { fetchWhiskeys, fetchWhiskeyById, searchWhiskeys, type WhiskeyCard } from '@/features/search/api/whiskeyApi';
import { updatePost } from '../api/communityApi';
import { RichEditor } from '../components/RichEditor';
import { usePost } from '../hooks/useCommunity';
import type { PostCategory } from '../types';
import { POST_CATEGORY_LABEL } from '../types';

const DEMO_USER_ID = 1;

const CATEGORY_OPTIONS: Array<{ value: PostCategory; label: string }> = [
  { value: 'F', label: POST_CATEGORY_LABEL.F },
  { value: 'R', label: POST_CATEGORY_LABEL.R },
  { value: 'L', label: POST_CATEGORY_LABEL.L },
  { value: 'Q', label: POST_CATEGORY_LABEL.Q },
  { value: 'G', label: POST_CATEGORY_LABEL.G },
  { value: 'B', label: POST_CATEGORY_LABEL.B },
];

export default function PostEditPage() {
  const { postId } = useParams();
  const numericId = postId ? Number(postId) : undefined;
  const navigate = useNavigate();

  const { data: post, isLoading, isError } = usePost(numericId, DEMO_USER_ID);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('F');
  const [submitting, setSubmitting] = useState(false);

  // 위스키 검색 (칼럼 전용)
  const [whiskeyQuery, setWhiskeyQuery] = useState('');
  const [whiskeyResults, setWhiskeyResults] = useState<WhiskeyCard[]>([]);
  const [whiskeyDropdownOpen, setWhiskeyDropdownOpen] = useState(false);
  const [selectedWhiskeys, setSelectedWhiskeys] = useState<WhiskeyCard[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.context);
      setCategory(post.category);
    }
  }, [post]);

  // Pre-populate selected whiskeys from existing whiskeyIds
  useEffect(() => {
    if (!post?.whiskeyIds?.length) return;
    Promise.all(post.whiskeyIds.map((id) => fetchWhiskeyById(id)))
      .then(setSelectedWhiskeys)
      .catch(() => {});
  }, [post?.whiskeyIds]);

  // Whiskey search effect (column only)
  useEffect(() => {
    if (post?.postType !== 'COLUMN') return;
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (!whiskeyQuery.trim()) {
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

    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const result = await searchWhiskeys({ q: whiskeyQuery.trim(), size: 20 });
        setWhiskeyResults(result.content);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [whiskeyQuery, post?.postType]);

  function selectWhiskey(whiskey: WhiskeyCard) {
    if (selectedWhiskeys.some((w) => w.id === whiskey.id)) return;
    setSelectedWhiskeys((prev) => [...prev, whiskey]);
    setWhiskeyQuery('');
    setWhiskeyDropdownOpen(false);
  }

  function removeWhiskey(id: number) {
    setSelectedWhiskeys((prev) => prev.filter((w) => w.id !== id));
  }

  if (isLoading) return <WireframePage scroll><PageLoader label="불러오는 중…" /></WireframePage>;
  if (isError || !post) return <WireframePage scroll><p className="wf-text-sm">게시글을 불러오지 못했습니다.</p></WireframePage>;
  if (!post.isOwner) return <WireframePage scroll><p className="wf-text-sm">수정 권한이 없습니다.</p></WireframePage>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await updatePost(DEMO_USER_ID, post!.id, {
        title: title.trim(),
        context: content,
        category,
        whiskeyIds: selectedWhiskeys.map((w) => w.id),
      });
      navigate(`/community/posts/${post!.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  const isColumn = post.postType === 'COLUMN';

  return (
    <WireframePage scroll>
      <button
        className="wf-chip"
        style={{ marginBottom: 16, cursor: 'pointer', border: 'none', background: 'none' }}
        onClick={() => navigate(-1)}
      >
        ← 뒤로
      </button>
      <h1 className="wf-title" style={{ marginBottom: 16 }}>게시글 수정</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!isColumn && (
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

        {/* 칼럼: 위스키 검색 */}
        {isColumn && (
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

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          maxLength={200}
          style={{ padding: 10, fontSize: 15, borderRadius: 4, border: '1px solid #ccc' }}
        />

        {isColumn ? (
          <RichEditor value={content} onChange={setContent} />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={12}
            style={{ padding: 10, fontSize: 14, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical' }}
          />
        )}

        <button
          type="submit"
          className="wf-chip wf-chip--on"
          style={{ cursor: 'pointer', border: 'none', alignSelf: 'flex-end', padding: '8px 24px' }}
          disabled={submitting || !title.trim() || !content.trim()}
        >
          {submitting ? '저장 중…' : '저장'}
        </button>
      </form>
    </WireframePage>
  );
}
