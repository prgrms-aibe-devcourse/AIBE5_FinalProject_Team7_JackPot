// 게시글 상세 페이지 — 본문·좋아요·댓글 스레드·관련 위스키 링크를 통합 표시
// COLUMN 타입은 ReactMarkdown으로 렌더링해 칼럼 고유 디자인 유지
import '../community.css';
import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { PATHS } from '@/app/router/paths';
import { isLoggedIn, getStoredUserId } from '@/shared/lib/authSession';
import { resolveProfileImageUrl } from '@/shared/lib/mediaUrl';
import { confirmToast } from '@/shared/components/ui/ConfirmToast';
import { UserProfileLink } from '@/shared/components/UserProfileLink';
import { fetchWhiskeyById, type WhiskeyCard } from '@/features/search/api/whiskeyApi';
import { deletePost } from '../api/communityApi';
import { CommentThread } from '../components/CommentItem';
import { ReportModal } from '../components/ReportModal';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
  useLikePost,
  usePost,
} from '../hooks/useCommunity';
import { getPostDetailTopicLabel } from '../utils/postCategoryDisplay';
import { htmlImgsToMarkdown, isRichEditorHtml } from '../utils/postBodyRender';

const MARKDOWN_BODY_COMPONENTS = {
  h1: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
  h2: ({ children }: { children?: ReactNode }) => <h3>{children}</h3>,
  h3: ({ children }: { children?: ReactNode }) => <h4>{children}</h4>,
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <span className="wf-markdown-img-wrap">
      <img
        src={src}
        alt={alt}
        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
      />
    </span>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  ),
};

// ISO 8601 문자열에서 분 단위까지만 잘라 'YYYY-MM-DD HH:mm' 형태로 표시
function formatDate(iso: string): string {
  return iso.slice(0, 16).replace('T', ' ');
}

export default function PostDetailPage() {
  const { postId } = useParams();
  // URL 파라미터는 string이므로 API 호출 전에 숫자로 변환
  const numericId = postId ? Number(postId) : undefined;
  const navigate = useNavigate();

  const qc = useQueryClient();
  const { data: post, isLoading, isError } = usePost(numericId);
  const { data: comments = [], isLoading: commentsLoading } = useComments(numericId);

  // mutate 함수들을 미리 생성해두면 조건부 훅 호출 문제를 피할 수 있음
  const likeMutation = useLikePost(numericId!);
  const createCommentMutation = useCreateComment(numericId!);
  const deleteCommentMutation = useDeleteComment(numericId!);
  const updateCommentMutation = useUpdateComment(numericId!);

  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyToNickname, setReplyToNickname] = useState<string | null>(null);
  const [linkedWhiskeys, setLinkedWhiskeys] = useState<WhiskeyCard[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [authorAvatarError, setAuthorAvatarError] = useState(false);

  // 게시글에 연결된 위스키 ID 배열을 상세 정보로 병렬 변환
  // 빈 배열이거나 undefined이면 API 호출을 아예 건너뜀
  useEffect(() => {
    setAuthorAvatarError(false);
  }, [post?.authorId, post?.id]);

  useEffect(() => {
    if (!post?.whiskeyIds?.length) return;
    Promise.all(post.whiskeyIds.map((id) => fetchWhiskeyById(id)))
      .then(setLinkedWhiskeys)
      .catch(() => {});
  }, [post?.whiskeyIds]);

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
    if (!(await confirmToast({ message: '게시글을 삭제하시겠습니까?', danger: true }))) return;
    await deletePost(post!.id);
    qc.invalidateQueries({ queryKey: ['community'] });
    const boardPath: Record<string, string> = {
      COLUMN: PATHS.COMMUNITY_COLUMNS,
      FREE: PATHS.COMMUNITY_FREE,
      QA: PATHS.COMMUNITY_QNA,
      NOTICE: PATHS.COMMUNITY_NOTICES,
    };
    navigate(boardPath[post!.postType] ?? PATHS.COMMUNITY);
  }

  // 로그인 여부를 확인한 뒤에만 실제 동작을 실행 — 모든 인증 필요 액션에 공통 적용
  function requireLogin(action: () => void) {
    if (!isLoggedIn()) {
      navigate(PATHS.LOGIN);
      return;
    }
    action();
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn()) { navigate(PATHS.LOGIN); return; }
    if (!commentText.trim()) return;
    await createCommentMutation.mutateAsync({
      content: commentText.trim(),
      // parentCommentId가 null이면 최상위 댓글로 서버에 전달됨
      parentCommentId: replyToId,
    });
    setCommentText('');
    setReplyToId(null);
    setReplyToNickname(null);
  }

  const topicLabel = getPostDetailTopicLabel(post.postType, post.category);

  return (
    <WireframePage scroll>
      {showReportModal && (
        <ReportModal
          targetId={post.id}
          targetType="POST"
          onClose={() => setShowReportModal(false)}
        />
      )}
      <button
        className="wf-chip wf-community-back-btn"
        onClick={() => navigate(-1)}
      >
        ← 뒤로
      </button>

      <article>
        <header className="wf-post-header">
          {topicLabel ? (
            <p className="wf-post-header__topic">{topicLabel}</p>
          ) : null}
          <h1 className="wf-title wf-post-title">{post.title}</h1>
          <div className="wf-post-header__author">
            <span className="wf-post-header__avatar-wrap">
              {!authorAvatarError ? (
                <img
                  src={resolveProfileImageUrl(post.authorProfileImageUrl, post.authorId)}
                  alt=""
                  className="wf-post-header__avatar"
                  onError={() => setAuthorAvatarError(true)}
                />
              ) : (
                <span className="wf-post-header__avatar wf-comment-feed__avatar--fallback" aria-hidden />
              )}
            </span>
            <p className="wf-post-header__meta-line">
              <UserProfileLink userId={post.authorId} className="wf-post-header__author-link">
                <strong className="wf-post-header__nickname">{post.authorNickname}</strong>
              </UserProfileLink>
              <span className="wf-post-header__meta-sep" aria-hidden>·</span>
              <span className="wf-post-header__date">{formatDate(post.createdAt)}</span>
            </p>
          </div>
          <div className="wf-post-header__footer">
            <button
              type="button"
              className={`wf-post-header__action${post.isLiked ? ' wf-post-header__action--on' : ''}`}
              onClick={() => requireLogin(() => likeMutation.mutate(post.isLiked))}
              disabled={likeMutation.isPending}
            >
              좋아요 {post.likeCount}
            </button>
            <span className="wf-post-header__stat">댓글 {post.commentCount}</span>
            <span className="wf-post-header__stat">조회 {post.viewCount}</span>
            {post.isOwner && (
              <>
                <button
                  type="button"
                  className="wf-post-header__action"
                  onClick={() => navigate(`/community/posts/${post.id}/edit`)}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="wf-post-header__action wf-post-header__action--danger"
                  onClick={handleDelete}
                >
                  삭제
                </button>
              </>
            )}
            {!post.isOwner && isLoggedIn() && (
              <button
                type="button"
                className="wf-post-header__action"
                onClick={() => setShowReportModal(true)}
              >
                신고
              </button>
            )}
          </div>
        </header>

        {/* 본문 렌더링:
            - COLUMN + RichEditor HTML(p/h2 등 block 태그): dangerouslySetInnerHTML
            - COLUMN + 마크다운(앞에 <img>만 붙은 마이그레이션 데이터 포함): ReactMarkdown
            - 그 외 HTML('<' 시작 + block 태그): dangerouslySetInnerHTML
            - 그 외: pre-wrap 일반 텍스트 */}
        {post.postType === 'COLUMN' ? (
          <div className="wf-box wf-post-body wf-post-body--column wf-markdown-body">
            {isRichEditorHtml(post.context) ? (
              <>
                {/* RichEditor 작성 HTML 내부 img 스타일 — dangerouslySetInnerHTML은 인라인 CSS로 자식 요소를 제어할 수 없어 scoped style 사용 */}
                <style>{`
                  .column-html-body img {
                    max-width: 100%;
                    border-radius: 8px;
                    margin: 16px 0;
                    display: block;
                  }
                  .column-html-body p { margin: 0 0 14px; }
                  .column-html-body h2 { font-size: 20px; font-weight: 700; margin: 28px 0 10px; border-bottom: 1px solid var(--wf-border); padding-bottom: 6px; }
                  .column-html-body h3 { font-size: 17px; font-weight: 700; margin: 22px 0 8px; }
                  .column-html-body ul, .column-html-body ol { padding-left: 20px; margin: 0 0 14px; }
                  .column-html-body li { margin-bottom: 4px; }
                  .column-html-body blockquote { border-left: 3px solid var(--wf-accent); padding-left: 14px; color: var(--wf-muted); margin: 16px 0; font-style: italic; }
                `}</style>
                <div className="column-html-body" dangerouslySetInnerHTML={{ __html: post.context }} />
              </>
            ) : (
              <ReactMarkdown components={MARKDOWN_BODY_COMPONENTS}>
                {htmlImgsToMarkdown(post.context)}
              </ReactMarkdown>
            )}
          </div>
        ) : post.context.startsWith('<') ? (
          <div
            className="wf-box wf-post-body"
            dangerouslySetInnerHTML={{ __html: post.context }}
          />
        ) : (
          <div className="wf-box wf-post-body wf-post-body--plain">
            {post.context}
          </div>
        )}

        {linkedWhiskeys.length > 0 && (
          <div className="wf-post-linked-whiskeys">
            <p className="wf-text-xs wf-post-linked-label">관련 위스키</p>
            <div className="wf-post-linked-row">
              {linkedWhiskeys.map((w) => (
                <Link key={w.id} to={`/whiskey/${w.id}`} className="wf-chip wf-post-whiskey-chip">
                  {w.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <section className="wf-comment-section">
        <h2 className="wf-section-title">댓글 {post.commentCount}</h2>
        {commentsLoading ? (
          <p className="wf-text-sm">댓글 불러오는 중…</p>
        ) : (
          <CommentThread
            comments={comments}
            onReply={(parentId, nickname) => requireLogin(() => {
              setReplyToId(parentId);
              setReplyToNickname(nickname);
            })}
            onDelete={(commentId) => deleteCommentMutation.mutate(commentId)}
            onEdit={(commentId, content) => updateCommentMutation.mutateAsync({ commentId, content })}
            currentUserId={getStoredUserId() ?? undefined}
          />
        )}

        <form onSubmit={handleSubmitComment} className="wf-comment-compose">
          {replyToId != null && (
            <div className="wf-comment-compose__reply-banner">
              <span className="wf-comment-compose__reply-label">
                {replyToNickname ? `${replyToNickname}에게 답글` : '답글 작성 중'}
              </span>
              <button
                type="button"
                className="wf-comment-compose__reply-cancel"
                onClick={() => {
                  setReplyToId(null);
                  setReplyToNickname(null);
                }}
              >
                취소
              </button>
            </div>
          )}
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={isLoggedIn() ? '댓글을 입력하세요…' : '로그인 후 댓글을 작성할 수 있어요'}
            rows={3}
            className="wf-comment-compose__textarea"
            disabled={createCommentMutation.isPending}
          />
          <div className="wf-comment-compose__footer">
            <button
              type="submit"
              className="wf-comment-compose__submit"
              disabled={createCommentMutation.isPending || !commentText.trim()}
            >
              {createCommentMutation.isPending ? '등록 중…' : '등록'}
            </button>
          </div>
        </form>
      </section>
    </WireframePage>
  );
}
