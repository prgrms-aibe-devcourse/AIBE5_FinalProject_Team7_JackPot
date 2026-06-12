// 게시글 상세 페이지 — 본문·좋아요·댓글 스레드·관련 위스키 링크를 통합 표시
// COLUMN 타입은 ReactMarkdown으로 렌더링해 칼럼 고유 디자인 유지
import '../community.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { PATHS } from '@/app/router/paths';
import { isLoggedIn, getStoredUserId } from '@/shared/lib/authSession';
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
import { POST_CATEGORY_LABEL } from '../types';

// ISO 8601 문자열에서 분 단위까지만 잘라 'YYYY-MM-DD HH:mm' 형태로 표시
function formatDate(iso: string): string {
  return iso.slice(0, 16).replace('T', ' ');
}

export default function PostDetailPage() {
  const { postId } = useParams();
  // URL 파라미터는 string이므로 API 호출 전에 숫자로 변환
  const numericId = postId ? Number(postId) : undefined;
  const navigate = useNavigate();

  const { data: post, isLoading, isError } = usePost(numericId);
  const { data: comments = [], isLoading: commentsLoading } = useComments(numericId);

  // mutate 함수들을 미리 생성해두면 조건부 훅 호출 문제를 피할 수 있음
  const likeMutation = useLikePost(numericId!);
  const createCommentMutation = useCreateComment(numericId!);
  const deleteCommentMutation = useDeleteComment(numericId!);
  const updateCommentMutation = useUpdateComment(numericId!);

  const [commentText, setCommentText] = useState('');
  // null이면 최상위 댓글, 숫자면 해당 댓글에 대한 대댓글 작성 중
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [linkedWhiskeys, setLinkedWhiskeys] = useState<WhiskeyCard[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);

  // 게시글에 연결된 위스키 ID 배열을 상세 정보로 병렬 변환
  // 빈 배열이거나 undefined이면 API 호출을 아예 건너뜀
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
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    await deletePost(post!.id);
    navigate(PATHS.COMMUNITY);
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
  }

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
          {/* COLUMN 타입은 카테고리·postType 태그가 무의미하므로 표시 생략 */}
          {post.postType !== 'COLUMN' && (
            <div className="wf-post-tags">
              <span className="wf-chip wf-chip--sm">
                {POST_CATEGORY_LABEL[post.category] ?? post.category}
              </span>
              <span className="wf-chip wf-chip--sm">{post.postType}</span>
            </div>
          )}
          <h1 className="wf-title wf-post-title">{post.title}</h1>
          <p className="wf-text-xs wf-post-meta">
            작성자{' '}
            <UserProfileLink userId={post.authorId}>#{post.authorId}</UserProfileLink>
            {' · '}
            {formatDate(post.createdAt)}
          </p>
          <div className="wf-post-actions">
            {/* isLiked 상태를 toggling API에 인자로 넘겨 현재 상태 기반으로 요청 방향을 결정 */}
            <button
              className="wf-chip wf-community-filter-btn"
              onClick={() => requireLogin(() => likeMutation.mutate(post.isLiked))}
              disabled={likeMutation.isPending}
            >
              {post.isLiked ? '♥' : '♡'} {post.likeCount}
            </button>
            <span className="wf-text-xs wf-post-stat">댓글 {post.commentCount}</span>
            <span className="wf-text-xs wf-post-stat">조회 {post.viewCount}</span>
            {/* isOwner는 서버가 현재 사용자 기준으로 반환하므로 프론트에서 별도 ID 비교 불필요 */}
            {post.isOwner && (
              <>
                <button
                  className="wf-chip wf-community-filter-btn"
                  onClick={() => navigate(`/community/posts/${post.id}/edit`)}
                >
                  수정
                </button>
                <button
                  className="wf-chip wf-community-filter-btn wf-post-delete-btn"
                  onClick={handleDelete}
                >
                  삭제
                </button>
              </>
            )}
            {/* 본인 게시글이 아닐 때만 신고 버튼 표시 */}
            {!post.isOwner && isLoggedIn() && (
              <button
                className="wf-chip wf-community-filter-btn wf-post-report-btn"
                onClick={() => setShowReportModal(true)}
              >
                🚨 신고
              </button>
            )}
          </div>
        </header>

        {/* 본문 렌더링:
            - COLUMN + HTML(RichEditor 작성): dangerouslySetInnerHTML — 서버 sanitize 필수
            - COLUMN + 마크다운(마이그레이션 데이터): ReactMarkdown으로 칼럼 고유 디자인 적용
            - 그 외 HTML('<' 시작): dangerouslySetInnerHTML
            - 그 외: pre-wrap 일반 텍스트 */}
        {post.postType === 'COLUMN' ? (
          <div className="wf-box wf-post-body wf-post-body--column wf-markdown-body">
            {post.context.startsWith('<') ? (
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
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h2>{children}</h2>,
                  h2: ({ children }) => <h3>{children}</h3>,
                  h3: ({ children }) => <h4>{children}</h4>,
                  img: ({ src, alt }) => (
                    <span className="wf-markdown-img-wrap">
                      <img
                        src={src}
                        alt={alt}
                        onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                      />
                    </span>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                  ),
                }}
              >
                {post.context}
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

      <section>
        <h2 className="wf-section-title">댓글 {post.commentCount}</h2>
        {commentsLoading ? (
          <p className="wf-text-sm">댓글 불러오는 중…</p>
        ) : (
          <CommentThread
            comments={comments}
            onReply={(parentId) => requireLogin(() => setReplyToId(parentId))}
            onDelete={(commentId) => deleteCommentMutation.mutate(commentId)}
            onEdit={(commentId, content) => updateCommentMutation.mutateAsync({ commentId, content })}
            // getStoredUserId()가 null이면 undefined로 변환해 CommentItem 내부 isOwner 판단에 영향 없음
            currentUserId={getStoredUserId() ?? undefined}
          />
        )}

        <form onSubmit={handleSubmitComment} className="wf-comment-form">
          {/* 대댓글 모드 진입 시 어떤 댓글에 답글 중인지 안내 배너 표시 */}
          {replyToId != null && (
            <div className="wf-comment-reply-banner">
              <span className="wf-text-xs wf-post-stat">
                댓글 #{replyToId}에 답글 작성 중
              </span>
              <button
                type="button"
                className="wf-text-xs wf-comment-cancel-btn"
                onClick={() => setReplyToId(null)}
              >
                취소
              </button>
            </div>
          )}
          <div className="wf-comment-input-row">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={isLoggedIn() ? '댓글을 입력하세요…' : '로그인 후 댓글을 작성할 수 있어요'}
              rows={3}
              className="wf-comment-textarea"
            />
            <button
              type="submit"
              className="wf-chip wf-chip--on wf-comment-submit-btn"
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
