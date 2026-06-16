// 댓글 단일 항목 및 재귀 트리 렌더러 — 중첩 답글을 depth 인덴트로 시각화
import { useState } from 'react';
import { UserProfileLink } from '@/shared/components/UserProfileLink';
import { confirmToast } from '@/shared/components/ui/ConfirmToast';
import { ReportModal } from './ReportModal';
import type { CommentTreeResponse } from '../types';

interface CommentItemProps {
  comment: CommentTreeResponse;
  depth?: number;
  onReply?: (parentId: number) => void;
  onDelete?: (commentId: number) => void;
  // 수정 완료 후 캐시 갱신이 필요하므로 Promise 반환 타입을 요구
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
  // userId 비교로 소유 여부를 판단 — null/undefined면 항상 false
  const isOwner = currentUserId != null && comment.userId === currentUserId;
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [showReport, setShowReport] = useState(false);

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
    // depth * 20px 인덴트로 대댓글 계층을 시각적으로 구분
    <div className="wf-comment-item" style={{ marginLeft: depth * 20 }}>
      {showReport && (
        <ReportModal
          targetId={comment.id}
          targetType="COMMENT"
          onClose={() => setShowReport(false)}
        />
      )}
      <div className="wf-box wf-comment-box">
        <div className="wf-comment-box__head">
          <span className="wf-text-xs wf-comment-author">
            {comment.isDeleted ? (
              // 삭제된 댓글은 내용 대신 안내 문구를 표시하고 작성자 링크를 숨김
              '(삭제됨)'
            ) : comment.userId != null ? (
              <UserProfileLink userId={comment.userId}>
                {comment.nickname ?? `사용자 ${comment.userId}`}
              </UserProfileLink>
            ) : (
              comment.nickname ?? '사용자'
            )}
          </span>
          <span className="wf-text-xs wf-comment-date">
            {formatDate(comment.createdAt)}
          </span>
        </div>

        {editing ? (
          <div className="wf-comment-edit-wrap">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="wf-comment-edit-textarea"
            />
            <div className="wf-comment-edit-actions">
              <button
                className="wf-chip wf-chip--on wf-comment-edit-save"
                onClick={handleEditSave}
                disabled={saving || !editText.trim()}
              >
                {saving ? '저장 중…' : '저장'}
              </button>
              {/* 취소 시 editText를 원래 comment.content로 복원해 다음 수정 시도에 잔류 텍스트가 남지 않도록 함 */}
              <button
                className="wf-text-xs wf-comment-edit-cancel"
                onClick={() => { setEditing(false); setEditText(comment.content); }}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <p className={`wf-comment-text${comment.isDeleted ? ' wf-comment-text--deleted' : ''}`}>
            {comment.content}
          </p>
        )}

        {/* 수정 중에는 액션 버튼을 숨겨 혼동을 방지 */}
        {!editing && (
          <div className="wf-comment-actions">
            {/* 삭제된 댓글에는 답글 버튼을 표시하지 않음 */}
            {!comment.isDeleted && onReply && (
              <button
                className="wf-text-xs wf-comment-action-btn"
                onClick={() => onReply(comment.id)}
              >
                답글
              </button>
            )}
            {isOwner && !comment.isDeleted && onEdit && (
              <button
                className="wf-text-xs wf-comment-action-btn"
                onClick={() => { setEditText(comment.content); setEditing(true); }}
              >
                수정
              </button>
            )}
            {isOwner && onDelete && !comment.isDeleted && (
              <button
                className="wf-text-xs wf-comment-action-btn wf-comment-action-btn--danger"
                onClick={async () => {
                  const ok = await confirmToast({ message: '댓글을 삭제하시겠습니까?', danger: true });
                  if (!ok) return;
                  onDelete(comment.id);
                }}
              >
                삭제
              </button>
            )}
            {/* 본인 댓글이 아닐 때만 신고 버튼 표시 */}
            {!isOwner && currentUserId != null && !comment.isDeleted && (
              <button
                className="wf-text-xs wf-comment-action-btn"
                onClick={() => setShowReport(true)}
              >
                🚨 신고
              </button>
            )}
          </div>
        )}
      </div>
      {/* 재귀 렌더링: replies 배열을 순회해 자식 댓글을 depth+1로 렌더링 */}
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
    </div>
  );
}

interface CommentThreadProps {
  comments: CommentTreeResponse[];
  onReply?: (parentId: number) => void;
  onDelete?: (commentId: number) => void;
  onEdit?: (commentId: number, content: string) => Promise<void>;
  currentUserId?: number;
}

// 최상위 댓글 목록을 받아 CommentItem을 나열하는 컨테이너
// 로직 없이 위임만 하므로 별도 메모이제이션 불필요
export function CommentThread({ comments, onReply, onDelete, onEdit, currentUserId }: CommentThreadProps) {
  return (
    <div>
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          onReply={onReply}
          onDelete={onDelete}
          onEdit={onEdit}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
