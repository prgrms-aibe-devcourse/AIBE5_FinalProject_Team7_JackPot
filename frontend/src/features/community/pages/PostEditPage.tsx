import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PageLoader } from '@/shared/components/ui/PageLoader';
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

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.context);
      setCategory(post.category);
    }
  }, [post]);

  if (isLoading) return <WireframePage scroll><PageLoader label="불러오는 중…" /></WireframePage>;
  if (isError || !post) return <WireframePage scroll><p className="wf-text-sm">게시글을 불러오지 못했습니다.</p></WireframePage>;
  if (!post.isOwner) return <WireframePage scroll><p className="wf-text-sm">수정 권한이 없습니다.</p></WireframePage>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await updatePost(DEMO_USER_ID, post!.id, { title: title.trim(), context: content, category });
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
