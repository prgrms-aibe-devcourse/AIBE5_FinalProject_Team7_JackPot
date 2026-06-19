// 댓글 단일 항목 및 재귀 트리 렌더러 — 플랫 피드 + 왼쪽 border 들여쓰기
import { useState, type CSSProperties } from 'react';
import { UserProfileLink } from '@/shared/components/UserProfileLink';
import { confirmToast } from '@/shared/components/ui/ConfirmToast';
import { resolveProfileImageUrl } from '@/shared/lib/mediaUrl';
import { ReportModal } from './ReportModal';
import type { CommentTreeResponse } from '../types';

interface CommentItemProps {
  comment: CommentTreeResponse;
  depth?: number;
  onReply?: (parentId: number, nickname: string | null) => void;
  onDelete?: (commentId: number) => void;
  onEdit?: (commentId: number, content: string) => Promise<void>;
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
  onEdit,
  currentUserId,
}: CommentItemProps) {
  const isOwner = currentUserId != null && comment.userId === currentUserId;
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const displayName = comment.nickname ?? (comment.userId != null ? `사용자 ${comment.userId}` : '사용자');
  const avatarSrc = comment.userId != null
    ? resolveProfileImageUrl(null, comment.userId)
    : resolveProfileImageUrl(null, comment.id);

  async function handleEditSave() {
    if (!editText.trim() || !onEdit) return;
    setSaving(true);
    try {
      await onEdit(comment.id, editText.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <li
      className={`wf-comment-feed__item${depth > 0 ? ' wf-comment-feed__item--reply' : ''}`}
      style={{ '--comment-depth': depth } as CSSProperties}
    >
      {showReport && (
        <ReportModal
          targetId={comment.id}
          targetType="COMMENT"
          onClose={() => setShowReport(false)}
        />
      )}

      {comment.isDeleted ? (
        <p className="wf-comment-feed__deleted">삭제된 댓글입니다.</p>
      ) : (
        <>
          <div className="wf-comment-feed__head">
            <span className="wf-comment-feed__avatar-wrap">
              {!avatarError ? (
                <img
                  src={avatarSrc}
                  alt=""
                  className="wf-comment-feed__avatar"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="wf-comment-feed__avatar wf-comment-feed__avatar--fallback" aria-hidden />
              )}
            </span>
            <div className="wf-comment-feed__meta-line">
              {comment.userId != null ? (
                <UserProfileLink userId={comment.userId} className="wf-comment-feed__author-link">
                  <strong className="wf-comment-feed__nickname">{displayName}</strong>
                </UserProfileLink>
              ) : (
                <strong className="wf-comment-feed__nickname">{displayName}</strong>
              )}
              <span className="wf-comment-feed__meta-sep" aria-hidden>·</span>
              <span className="wf-comment-feed__date">{formatDate(comment.createdAt)}</span>
            </div>
          </div>

          {editing ? (
            <div className="wf-comment-feed__edit">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="wf-comment-feed__edit-textarea"
              />
              <div className="wf-comment-feed__edit-actions">
                <button
                  type="button"
                  className="wf-comment-feed__action wf-comment-feed__action--primary"
                  onClick={handleEditSave}
                  disabled={saving || !editText.trim()}
                >
                  {saving ? '저장 중…' : '저장'}
                </button>
                <button
                  type="button"
                  className="wf-comment-feed__action"
                  onClick={() => { setEditing(false); setEditText(comment.content); }}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p className="wf-comment-feed__text">{comment.content}</p>
          )}

          {!editing && (
            <div className="wf-comment-feed__actions">
              {onReply && (
                <button
                  type="button"
                  className="wf-comment-feed__action"
                  onClick={() => onReply(comment.id, comment.nickname)}
                >
                  답글
                </button>
              )}
              {isOwner && onEdit && (
                <button
                  type="button"
                  className="wf-comment-feed__action"
                  onClick={() => { setEditText(comment.content); setEditing(true); }}
                >
                  수정
                </button>
              )}
              {isOwner && onDelete && (
                <button
                  type="button"
                  className="wf-comment-feed__action wf-comment-feed__action--danger"
                  onClick={async () => {
                    const ok = await confirmToast({ message: '댓글을 삭제하시겠습니까?', danger: true });
                    if (!ok) return;
                    onDelete(comment.id);
                  }}
                >
                  삭제
                </button>
              )}
              {!isOwner && currentUserId != null && (
                <button
                  type="button"
                  className="wf-comment-feed__action"
                  onClick={() => setShowReport(true)}
                >
                  신고
                </button>
              )}
            </div>
          )}
        </>
      )}

      {comment.replies.length > 0 ? (
        <ul className="wf-comment-feed wf-comment-feed--nested">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              currentUserId={currentUserId}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

interface CommentThreadProps {
  comments: CommentTreeResponse[];
  onReply?: (parentId: number, nickname: string | null) => void;
  onDelete?: (commentId: number) => void;
  onEdit?: (commentId: number, content: string) => Promise<void>;
  currentUserId?: number;
}

export function CommentThread({ comments, onReply, onDelete, onEdit, currentUserId }: CommentThreadProps) {
  if (comments.length === 0) {
    return <p className="wf-comment-feed__empty">아직 댓글이 없습니다.</p>;
  }

  return (
    <ul className="wf-comment-feed">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onDelete={onDelete}
          onEdit={onEdit}
          currentUserId={currentUserId}
        />
      ))}
    </ul>
  );
}
