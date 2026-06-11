import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { useWhiskeyDetail } from '@/features/whiskey/hooks/useWhiskeyDetail';
import {
  createTastingNote,
  deleteTastingNote,
  fetchMyTastingNoteForWhiskey,
  updateTastingNote,
  type TastingNoteSaveRequest,
} from '../api/noteApi';
import '../tasting-note.css';

const SCORE_FIELDS = [
  { key: 'bodyScore', label: '바디' },
  { key: 'finishScore', label: '피니시' },
  { key: 'smokyScore', label: '스모키' },
  { key: 'spicyScore', label: '스파이시' },
  { key: 'sweetScore', label: '단맛' },
] as const;

const TAG_OPTIONS = [
  { id: 1, category: '향', name: '시트러스' },
  { id: 2, category: '향', name: '베리류' },
  { id: 3, category: '향', name: '꽃향' },
  { id: 4, category: '향', name: '허브향' },
  { id: 5, category: '향', name: '곡물향' },
  { id: 6, category: '향', name: '견과향' },
  { id: 7, category: '향', name: '꿀향' },
  { id: 8, category: '향', name: '바닐라향' },
  { id: 9, category: '향', name: '캐러멜향' },
  { id: 10, category: '향', name: '초콜릿향' },
  { id: 11, category: '향', name: '커피향' },
  { id: 12, category: '향', name: '후추향' },
  { id: 13, category: '향', name: '계피향' },
  { id: 14, category: '향', name: '정향' },
  { id: 15, category: '향', name: '우디(나무, 오크)' },
  { id: 16, category: '향', name: '가죽향' },
  { id: 17, category: '향', name: '스모키' },
  { id: 18, category: '향', name: '피트향' },
  { id: 19, category: '향', name: '흙내음' },
  { id: 20, category: '향', name: '약품향' },
  { id: 101, category: '맛', name: '시트러스' },
  { id: 102, category: '맛', name: '베리류' },
  { id: 103, category: '맛', name: '허브맛' },
  { id: 104, category: '맛', name: '곡물맛' },
  { id: 105, category: '맛', name: '견과류맛' },
  { id: 106, category: '맛', name: '꿀맛' },
  { id: 107, category: '맛', name: '바닐라맛' },
  { id: 108, category: '맛', name: '캐러멜맛' },
  { id: 109, category: '맛', name: '초콜릿맛' },
  { id: 110, category: '맛', name: '커피맛' },
  { id: 111, category: '맛', name: '우디(나무, 오크)' },
  { id: 112, category: '맛', name: '스모키' },
  { id: 113, category: '맛', name: '피트감' },
  { id: 114, category: '맛', name: '흙맛' },
  { id: 115, category: '맛', name: '짠맛' },
];

type TagModalType = 'nose' | 'taste' | null;

type ScoreKey = (typeof SCORE_FIELDS)[number]['key'];
type Scores = Record<ScoreKey, number>;

function getCurrentUserId(): number | null {
  const value = localStorage.getItem('userId');
  if (!value) return null;

  const userId = Number(value);
  return Number.isFinite(userId) ? userId : null;
}

function toggleId(ids: number[], id: number) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export default function TastingNotePage() {
  const { whiskeyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const id = whiskeyId ?? '1';
  const currentUserId = getCurrentUserId();
  const { data: whiskey } = useWhiskeyDetail(id);
  const { data: existingNote, isLoading: noteLoading } = useQuery({
    queryKey: ['tasting-note', 'my', currentUserId, id],
    queryFn: () => fetchMyTastingNoteForWhiskey(id),
    enabled: currentUserId != null,
  });

  const [scores, setScores] = useState<Scores>({
    bodyScore: 0,
    finishScore: 0,
    smokyScore: 0,
    spicyScore: 0,
    sweetScore: 0,
  });
  const [memo, setMemo] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [tagModalType, setTagModalType] = useState<TagModalType>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEditMode = Boolean(existingNote);
  const detailPath = PATHS.WHISKEY_DETAIL.replace(':whiskeyId', id);

  useEffect(() => {
    if (!existingNote) return;

    setScores({
      bodyScore: existingNote.bodyScore ?? 0,
      finishScore: existingNote.finishScore ?? 0,
      smokyScore: existingNote.smokyScore ?? 0,
      spicyScore: existingNote.spicyScore ?? 0,
      sweetScore: existingNote.sweetScore ?? 0,
    });
    setMemo(existingNote.memo ?? '');
    setSelectedTagIds(existingNote.tags?.map((tag) => tag.id) ?? []);
    setIsDraft(Boolean(existingNote.isDraft ?? existingNote.draft));
  }, [existingNote]);

  const saveMutation = useMutation({
    mutationFn: (body: TastingNoteSaveRequest) => {
      if (currentUserId == null) {
        throw new Error('로그인 정보가 없습니다. 다시 로그인해주세요.');
      }

      if (existingNote) {
        return updateTastingNote(existingNote.id, body);
      }

      return createTastingNote(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasting-note', 'my', currentUserId, id] });
      queryClient.invalidateQueries({ queryKey: ['whiskey', 'detail', id] });
      navigate(detailPath);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (currentUserId == null) throw new Error('로그인 정보가 없습니다.');
      if (!existingNote) throw new Error('삭제할 노트가 없습니다.');
      return deleteTastingNote(existingNote.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasting-note', 'my', currentUserId, id] });
      queryClient.invalidateQueries({ queryKey: ['whiskey', 'detail', id] });
      navigate(detailPath);
    },
  });

  const tagGroups = useMemo(() => {
    return {
      nose: TAG_OPTIONS.filter((tag) => tag.category === '향'),
      taste: TAG_OPTIONS.filter((tag) => tag.category === '맛'),
    };
  }, []);

  const selectedTags = TAG_OPTIONS.filter((tag) => selectedTagIds.includes(tag.id));
  const selectedNoseCount = tagGroups.nose.filter((tag) => selectedTagIds.includes(tag.id)).length;
  const selectedTasteCount = tagGroups.taste.filter((tag) => selectedTagIds.includes(tag.id)).length;
  const currentTagOptions = tagModalType === 'nose' ? tagGroups.nose : tagGroups.taste;
  const currentSelectedCount = currentTagOptions.filter((tag) => selectedTagIds.includes(tag.id)).length;
  const tagModalTitle = tagModalType === 'nose' ? '향 태그' : '맛 태그';

  const handleScoreChange = (key: ScoreKey, value: string) => {
    const score = Number(value);
    setScores((prev) => ({
      ...prev,
      [key]: Number.isFinite(score) ? Math.min(Math.max(score, 0), 10) : 0,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (currentUserId == null) {
      setErrorMessage('로그인 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    try {
      await saveMutation.mutateAsync({
        whiskeyId: Number(id),
        ...scores,
        memo: memo.trim(),
        isDraft,
        tagIds: selectedTagIds,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '시음 노트 저장에 실패했습니다.');
    }
  };

  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">상세 / <strong>시음 노트</strong></p>
      <form className="wf-box wf-panel wf-note-editor" onSubmit={handleSubmit}>
        <div>
          <h1 className="wf-title">Tasting Note</h1>
          <p className="wf-text-sm">
            {whiskey?.name ?? `위스키 #${id}`} · {noteLoading ? '확인 중' : isEditMode ? '수정' : '새 노트'}
          </p>
        </div>

        <section className="wf-note-editor__scores">
          {SCORE_FIELDS.map(({ key, label }) => (
            <label key={key} className="wf-note-editor__score">
              <span className="wf-text-label">{label}</span>
              <div className="wf-note-editor__score-row">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={scores[key]}
                  onChange={(event) => handleScoreChange(key, event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={scores[key]}
                  onChange={(event) => handleScoreChange(key, event.target.value)}
                />
              </div>
            </label>
          ))}
        </section>

        <label className="wf-note-editor__memo-label">
          <span className="wf-text-label">메모</span>
          <textarea
            className="wf-review-textarea"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            rows={6}
            placeholder="향, 맛, 피니시, 마신 상황 등을 자유롭게 기록하세요."
          />
        </label>

        <section className="wf-note-editor__tags">
          <p className="wf-text-label">태그</p>
          <div className="wf-note-editor__tag-picker-row">
            <button
              type="button"
              className={`wf-box wf-note-editor__tag-picker${selectedNoseCount > 0 ? ' wf-box--accent' : ''}`}
              onClick={() => setTagModalType('nose')}
            >
              <span>향 태그</span>
              <strong>{selectedNoseCount > 0 ? `${selectedNoseCount}개 선택됨` : '선택'}</strong>
            </button>
            <button
              type="button"
              className={`wf-box wf-note-editor__tag-picker${selectedTasteCount > 0 ? ' wf-box--accent' : ''}`}
              onClick={() => setTagModalType('taste')}
            >
              <span>맛 태그</span>
              <strong>{selectedTasteCount > 0 ? `${selectedTasteCount}개 선택됨` : '선택'}</strong>
            </button>
          </div>

          {selectedTags.length > 0 ? (
            <div className="wf-note-editor__selected-tags" aria-label="선택된 태그">
              {selectedTags.map((tag) => (
                <span key={tag.id} className="wf-note-editor__selected-tag">
                  {tag.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="wf-text-sm wf-note-editor__no-tags">선택된 태그가 없습니다.</p>
          )}
        </section>

        <label className="wf-note-editor__draft">
          <input
            type="checkbox"
            checked={isDraft}
            onChange={(event) => setIsDraft(event.target.checked)}
          />
          임시 저장
        </label>

        {errorMessage && (
          <p className="wf-text-sm wf-note-editor__error">
            {errorMessage}
          </p>
        )}

        <div className="wf-note-editor__actions">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? '저장 중...' : isEditMode ? '수정 저장' : '새 노트 저장'}
          </Button>
          {isEditMode && (
            <Button
              type="button"
              variant="ghost"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirm('노트를 삭제하시겠습니까?')) {
                  deleteMutation.mutate();
                }
              }}
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={() => navigate(detailPath)}>
            취소
          </Button>
        </div>
      </form>

      {tagModalType ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tagModalTitle}
          className="wf-note-editor__tag-modal"
          onClick={() => setTagModalType(null)}
        >
          <div
            className="wf-box wf-box--solid wf-note-editor__tag-modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="wf-note-editor__tag-modal-head">
              <div>
                <p className="wf-text-label wf-note-editor__modal-title">{tagModalTitle}</p>
                <p className="wf-text-sm wf-note-editor__modal-count">선택 {currentSelectedCount}개</p>
              </div>
              <Button type="button" variant="ghost" className="wf-note-editor__modal-close-btn" onClick={() => setTagModalType(null)}>
                닫기
              </Button>
            </div>

            <div className="wf-note-editor__tag-modal-grid">
              {currentTagOptions.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`wf-box wf-note-editor__tag-modal-item${selected ? ' wf-box--accent' : ''}`}
                    onClick={() => setSelectedTagIds((ids) => toggleId(ids, tag.id))}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </WireframePage>
  );
}
