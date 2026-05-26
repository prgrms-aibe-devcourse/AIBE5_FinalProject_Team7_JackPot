import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { createPost } from '../api/communityApi';
import type { PostType, PostCategory } from '../types';
import { POST_CATEGORY_LABEL } from '../types';

const DEMO_USER_ID = 1;

const POST_TYPE_OPTIONS: Array<{ value: PostType; label: string }> = [
  { value: 'FREE', label: '자유게시판' },
  { value: 'QA', label: 'Q&A' },
];

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
  const defaultType = (searchParams.get('type') as PostType) ?? 'FREE';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>(defaultType);
  const [category, setCategory] = useState<PostCategory>('F');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const postId = await createPost(DEMO_USER_ID, { title: title.trim(), context: content.trim(), postType, category });
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
      <h1 className="wf-title" style={{ marginBottom: 16 }}>글쓰기</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {POST_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`wf-chip${postType === opt.value ? ' wf-chip--on' : ''}`}
              style={{ cursor: 'pointer', border: 'none', background: 'none' }}
              onClick={() => setPostType(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {postType === 'FREE' && (
          <div className="wf-chips" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`wf-chip${category === opt.value ? ' wf-chip--on' : ''}`}
                style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                onClick={() => setCategory(opt.value)}
              >
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
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={12}
          style={{ padding: 10, fontSize: 14, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical' }}
        />
        <button
          type="submit"
          className="wf-chip wf-chip--on"
          style={{ cursor: 'pointer', border: 'none', alignSelf: 'flex-end', padding: '8px 24px' }}
          disabled={submitting || !title.trim() || !content.trim()}
        >
          {submitting ? '등록 중…' : '등록'}
        </button>
      </form>
    </WireframePage>
  );
}
