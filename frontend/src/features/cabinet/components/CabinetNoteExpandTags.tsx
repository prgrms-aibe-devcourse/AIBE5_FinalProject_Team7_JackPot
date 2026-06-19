import { useMemo, useState } from 'react';
import type { TastingNoteTag } from '@/features/tasting-note/api/noteApi';

type NoteTagFilter = 'nose' | 'taste';

const TAB_LABEL: Record<NoteTagFilter, string> = {
  nose: '향',
  taste: '맛',
};

interface CabinetNoteExpandTagsProps {
  tags: TastingNoteTag[];
}

export function CabinetNoteExpandTags({ tags }: CabinetNoteExpandTagsProps) {
  const [filter, setFilter] = useState<NoteTagFilter>('nose');
  const filteredTags = useMemo(
    () => tags.filter((tag) => tag.category === filter),
    [filter, tags],
  );

  if (!tags.length) {
    return <p className="wf-cabinet-note-expand__empty">등록된 태그가 없습니다.</p>;
  }

  return (
    <div className="wf-cabinet-note-expand__tags">
      <div className="wf-cabinet-note-expand__tabs" role="group" aria-label="시음 노트 태그">
        {(['nose', 'taste'] as const).map((category) => (
          <button
            key={category}
            type="button"
            className={`wf-cabinet-note-expand__tab${filter === category ? ' wf-cabinet-note-expand__tab--on' : ''}`}
            onClick={() => setFilter(category)}
          >
            {TAB_LABEL[category]}
          </button>
        ))}
      </div>
      {filteredTags.length ? (
        <div className="wf-cabinet-feed__tags">
          {filteredTags.map((tag) => (
            <span key={tag.id} className="wf-cabinet-feed__tag">
              {tag.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="wf-cabinet-note-expand__empty">{TAB_LABEL[filter]} 태그가 없습니다.</p>
      )}
    </div>
  );
}
