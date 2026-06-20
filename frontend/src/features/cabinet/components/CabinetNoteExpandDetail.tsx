import type { MyTastingNote } from '@/features/tasting-note/api/noteApi';
import { CabinetNoteExpandTags } from '@/features/cabinet/components/CabinetNoteExpandTags';
import { CabinetNoteRadar } from '@/features/cabinet/components/CabinetNoteRadar';

interface CabinetNoteExpandDetailProps {
  note: MyTastingNote;
}

export function CabinetNoteExpandDetail({ note }: CabinetNoteExpandDetailProps) {
  return (
    <div className="wf-cabinet-note-expand">
      <div className="wf-cabinet-note-expand__radar">
        <CabinetNoteRadar note={note} />
      </div>
      <CabinetNoteExpandTags tags={note.tags ?? []} />
    </div>
  );
}
