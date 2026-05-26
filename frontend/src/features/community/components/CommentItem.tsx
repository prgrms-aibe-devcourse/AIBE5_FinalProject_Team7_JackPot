import type { CommentTreeResponse } from '../types';

interface CommentItemProps {
  comment: CommentTreeResponse;
  depth?: number;
  onReply?: (parentId: number) => void;
  onDelete?: (commentId: number) => void;
  currentUserId?: number;
}

function formatDate(iso: string): string {
  return iso.slice(0, 16).replace('T', ' ');
}

export function CommentItem({
  comment,
  depth = 0,
  onReply,
  onDelete,
  currentUserId,
}: CommentItemProps) {
  const isOwner = currentUserId != null && comment.userId === currentUserId;

  return (
    <div style={{ marginLeft: depth * 20, marginBottom: 8 }}>
      <div className="wf-box" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span className="wf-text-xs" style={{ color: '#888' }}>
            {comment.isDeleted ? '(삭제됨)' : `사용자 ${comment.userId ?? '?'}`}
          </span>
          <span className="wf-text-xs" style={{ color: '#aaa' }}>
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p style={{ margin: '0 0 6px', fontSize: 14, color: comment.isDeleted ? '#aaa' : undefined }}>
          {comment.content}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {!comment.isDeleted && onReply && (
            <button
              className="wf-text-xs"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#666' }}
              onClick={() => onReply(comment.id)}
            >
              답글
            </button>
          )}
          {isOwner && onDelete && !comment.isDeleted && (
            <button
              className="wf-text-xs"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#c00' }}
              onClick={() => onDelete(comment.id)}
            >
              삭제
            </button>
          )}
        </div>
      </div>
      {comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          onReply={onReply}
          onDelete={onDelete}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}

interface CommentThreadProps {
  comments: CommentTreeResponse[];
  onReply?: (parentId: number) => void;
  onDelete?: (commentId: number) => void;
  currentUserId?: number;
}

export function CommentThread({ comments, onReply, onDelete, currentUserId }: CommentThreadProps) {
  return (
    <div>
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          onReply={onReply}
          onDelete={onDelete}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
