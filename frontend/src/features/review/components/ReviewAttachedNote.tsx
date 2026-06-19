import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTastingNote } from '@/features/tasting-note/api/noteApi';
import { AttachedNotePanel } from './AttachedNotePanel';

interface ReviewAttachedNoteProps {
  noteId: number;
  defaultOpen: boolean;
}

function buildNoteSummary(note: {
  bodyScore?: number | null;
  finishScore?: number | null;
  tags?: { category: string }[] | null;
}) {
  const noseCount = note.tags?.filter((tag) => tag.category === 'nose').length ?? 0;
  const tasteCount = note.tags?.filter((tag) => tag.category === 'taste').length ?? 0;

  return [
    `바디 ${note.bodyScore ?? '-'}`,
    `피니시 ${note.finishScore ?? '-'}`,
    noseCount > 0 ? `향 ${noseCount}` : null,
    tasteCount > 0 ? `맛 ${tasteCount}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function ReviewAttachedNote({ noteId, defaultOpen }: ReviewAttachedNoteProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { data: note, isLoading, isError } = useQuery({
    queryKey: ['tasting-note', 'attached', noteId],
    queryFn: () => fetchTastingNote(noteId),
  });

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen, noteId]);

  if (isLoading) {
    return (
      <p className="wf-detail-reviews__note-summary wf-detail-reviews__note-summary--loading">
        노트 불러오는 중…
      </p>
    );
  }

  if (isError || !note) {
    return (
      <p className="wf-detail-reviews__note-summary wf-detail-reviews__note-summary--error">
        노트를 불러오지 못했습니다.
      </p>
    );
  }

  return (
    <div className="wf-detail-reviews__attached-note">
      <button
        type="button"
        className={`wf-detail-reviews__note-summary${open ? ' wf-detail-reviews__note-summary--open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="wf-detail-reviews__note-summary-label">Note</span>
        <span className="wf-detail-reviews__note-summary-spec">{buildNoteSummary(note)}</span>
        <span className="wf-detail-reviews__note-summary-action">{open ? '접기' : '자세히'}</span>
      </button>
      {open ? <AttachedNotePanel noteId={noteId} embedded /> : null}
    </div>
  );
}
