import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { PATHS } from '@/app/router/paths';
import { deletePost } from '../api/communityApi';
import { CommentThread } from '../components/CommentItem';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
  useLikePost,
  usePost,
} from '../hooks/useCommunity';
import { POST_CATEGORY_LABEL } from '../types';

const DEMO_USER_ID = 1;

function formatDate(iso: string): string {
  return iso.slice(0, 16).replace('T', ' ');
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const numericId = postId ? Number(postId) : undefined;
  const navigate = useNavigate();

  const { data: post, isLoading, isError } = usePost(numericId, DEMO_USER_ID);
  const { data: comments = [], isLoading: commentsLoading } = useComments(numericId);

  const likeMutation = useLikePost(numericId!, DEMO_USER_ID);
  const createCommentMutation = useCreateComment(numericId!, DEMO_USER_ID);
  const deleteCommentMutation = useDeleteComment(numericId!, DEMO_USER_ID);
  const updateCommentMutation = useUpdateComment(numericId!, DEMO_USER_ID);

  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <WireframePage scroll>
        <PageLoader label="게시글 불러오는 중…" />
      </WireframePage>
    );
  }

  if (isError || !post) {
    return (
      <WireframePage scroll>
        <p className="wf-text-sm">게시글을 불러오지 못했습니다.</p>
      </WireframePage>
    );
  }

  async function handleDelete() {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    await deletePost(DEMO_USER_ID, post!.id);
    navigate(PATHS.COMMUNITY);
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    await createCommentMutation.mutateAsync({
      content: commentText.trim(),
      parentCommentId: replyToId,
    });
    setCommentText('');
    setReplyToId(null);
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

      <article>
        <header style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <span className="wf-chip" style={{ fontSize: 11 }}>
              {POST_CATEGORY_LABEL[post.category] ?? post.category}
            </span>
            <span className="wf-chip" style={{ fontSize: 11 }}>{post.postType}</span>
          </div>
          <h1 className="wf-title" style={{ marginBottom: 4 }}>{post.title}</h1>
          <p className="wf-text-xs" style={{ color: '#888', marginBottom: 8 }}>
            작성자 {post.authorId} · {formatDate(post.createdAt)}
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className="wf-chip"
              style={{ cursor: 'pointer', border: 'none', background: 'none' }}
              onClick={() => likeMutation.mutate(post.isLiked)}
              disabled={likeMutation.isPending}
            >
              {post.isLiked ? '♥' : '♡'} {post.likeCount}
            </button>
            <span className="wf-text-xs" style={{ color: '#888' }}>댓글 {post.commentCount}</span>
            {post.isOwner && (
              <>
                <button
                  className="wf-chip"
                  style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                  onClick={() => navigate(`/community/posts/${post.id}/edit`)}
                >
                  수정
                </button>
                <button
                  className="wf-chip"
                  style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#c00' }}
                  onClick={handleDelete}
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </header>

        {post.context.startsWith('<') ? (
          <div
            className="wf-box"
            style={{ padding: 16, marginBottom: 24, lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: post.context }}
          />
        ) : (
          <div
            className="wf-box"
            style={{ padding: 16, marginBottom: 24, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
          >
            {post.context}
          </div>
        )}
      </article>

      <section>
        <h2 className="wf-section-title">댓글 {post.commentCount}</h2>
        {commentsLoading ? (
          <p className="wf-text-sm">댓글 불러오는 중…</p>
        ) : (
          <CommentThread
            comments={comments}
            onReply={(parentId) => setReplyToId(parentId)}
            onDelete={(commentId) => deleteCommentMutation.mutate(commentId)}
            onEdit={(commentId, content) => updateCommentMutation.mutateAsync({ commentId, content })}
            currentUserId={DEMO_USER_ID}
          />
        )}

        <form onSubmit={handleSubmitComment} style={{ marginTop: 16 }}>
          {replyToId != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="wf-text-xs" style={{ color: '#888' }}>
                댓글 #{replyToId}에 답글 작성 중
              </span>
              <button
                type="button"
                className="wf-text-xs"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c00' }}
                onClick={() => setReplyToId(null)}
              >
                취소
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요…"
              rows={3}
              style={{
                flex: 1,
                padding: 8,
                fontSize: 14,
                borderRadius: 4,
                border: '1px solid #ccc',
                resize: 'vertical',
              }}
            />
            <button
              type="submit"
              className="wf-chip wf-chip--on"
              style={{ cursor: 'pointer', alignSelf: 'flex-end', border: 'none' }}
              disabled={createCommentMutation.isPending}
            >
              등록
            </button>
          </div>
        </form>
      </section>
    </WireframePage>
  );
}
