import { useState } from 'react';
import type { CommentTreeResponse } from '../types';

interface CommentItemProps {
  comment: CommentTreeResponse;
  depth?: number;
  onReply?: (parentId: number) => void;
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

        {editing ? (
          <div style={{ marginBottom: 6 }}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: 6, fontSize: 14, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                className="wf-chip wf-chip--on"
                style={{ cursor: 'pointer', border: 'none', fontSize: 12 }}
                onClick={handleEditSave}
                disabled={saving || !editText.trim()}
              >
                {saving ? '저장 중…' : '저장'}
              </button>
              <button
                className="wf-text-xs"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#666' }}
                onClick={() => { setEditing(false); setEditText(comment.content); }}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <p style={{ margin: '0 0 6px', fontSize: 14, color: comment.isDeleted ? '#aaa' : undefined }}>
            {comment.content}
          </p>
        )}

        {!editing && (
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
            {isOwner && !comment.isDeleted && onEdit && (
              <button
                className="wf-text-xs"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#555' }}
                onClick={() => { setEditText(comment.content); setEditing(true); }}
              >
                수정
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
        )}
      </div>
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
