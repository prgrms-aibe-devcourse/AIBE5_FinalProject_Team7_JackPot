import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { useWhiskeyDetail } from '@/features/whiskey/hooks/useWhiskeyDetail';
import { toast } from '@/shared/components/ui/Toast';
import { confirmToast } from '@/shared/components/ui/ConfirmToast';
import { useTags } from '@/features/survey/hooks/useTags';
import { NoteScoreRadar } from '../components/NoteScoreRadar';
import '@/features/whiskey/whiskey.css';
import '@/features/review/review.css';
import '@/features/search/search.css';
import {
  analyzeNoteByAi,
  createTastingNote,
  deleteTastingNote,
  fetchTastingNote,
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

function formatType(type: string): string {
  const map: Record<string, string> = {
    single_malt: '싱글몰트',
    blended: '블렌디드',
    bourbon: '버번',
    rye: '라이',
  };
  return map[type] ?? type;
}

export default function TastingNotePage() {
  const { whiskeyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const id = whiskeyId ?? '1';
  const currentUserId = getCurrentUserId();
  const noteIdParam = searchParams.get('noteId');
  const parsedNoteId = noteIdParam ? Number(noteIdParam) : NaN;
  const targetNoteId = Number.isFinite(parsedNoteId) && parsedNoteId > 0 ? parsedNoteId : null;
  const returnTo = searchParams.get('returnTo');
  const { data: whiskey } = useWhiskeyDetail(id);
  const { data: noseGroups = [], isLoading: noseTagsLoading } = useTags('nose');
  const { data: tasteGroups = [], isLoading: tasteTagsLoading } = useTags('taste');
  // 이 화면은 그룹 구분 없이 평탄한 태그 목록을 사용 → 그룹을 펼쳐서 사용
  const noseTags = useMemo(() => noseGroups.flatMap((g) => g.tags), [noseGroups]);
  const tasteTags = useMemo(() => tasteGroups.flatMap((g) => g.tags), [tasteGroups]);
  const { data: existingNote, isLoading: noteLoading } = useQuery({
    queryKey: targetNoteId
      ? ['tasting-note', 'detail', currentUserId, targetNoteId]
      : ['tasting-note', 'my', currentUserId, id],
    queryFn: () => (
      targetNoteId
        ? fetchTastingNote(targetNoteId)
        : fetchMyTastingNoteForWhiskey(id)
    ),
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
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiError, setAiError] = useState('');
  const [imgError, setImgError] = useState(false);

  const isEditMode = Boolean(existingNote);
  const detailPath = PATHS.WHISKEY_DETAIL.replace(':whiskeyId', id);
  const cabinetNotePath = `${PATHS.CABINET}?section=bar&tab=note`;
  const writeReviewPath = (() => {
    const params = new URLSearchParams({ attachNote: '1' });
    const reviewReturnTo = searchParams.get('reviewReturnTo');
    if (reviewReturnTo) params.set('returnTo', reviewReturnTo);
    return `${PATHS.WRITE_REVIEW.replace(':whiskeyId', id)}?${params}`;
  })();
  const exitPath =
    returnTo === 'cabinet-note'
      ? cabinetNotePath
      : returnTo === 'write-review'
        ? writeReviewPath
        : detailPath;

  useEffect(() => {
    setImgError(false);
  }, [id]);

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
      queryClient.invalidateQueries({ queryKey: ['tasting-notes', 'my'] });
      if (targetNoteId) {
        queryClient.invalidateQueries({ queryKey: ['tasting-note', 'detail', currentUserId, targetNoteId] });
      }
      queryClient.invalidateQueries({ queryKey: ['whiskey', 'detail', id] });
      navigate(exitPath);
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
      queryClient.invalidateQueries({ queryKey: ['tasting-notes', 'my'] });
      if (targetNoteId) {
        queryClient.invalidateQueries({ queryKey: ['tasting-note', 'detail', currentUserId, targetNoteId] });
      }
      queryClient.invalidateQueries({ queryKey: ['whiskey', 'detail', id] });
      navigate(exitPath);
    },
  });

  const tagGroups = useMemo(
    () => ({ nose: noseTags, taste: tasteTags }),
    [noseTags, tasteTags],
  );

  const allTags = useMemo(() => [...noseTags, ...tasteTags], [noseTags, tasteTags]);
  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id));
  const selectedNoseCount = tagGroups.nose.filter((tag) => selectedTagIds.includes(tag.id)).length;
  const selectedTasteCount = tagGroups.taste.filter((tag) => selectedTagIds.includes(tag.id)).length;
  const currentTagOptions = tagModalType === 'nose' ? tagGroups.nose : tagGroups.taste;
  const currentSelectedCount = currentTagOptions.filter((tag) => selectedTagIds.includes(tag.id)).length;
  const currentTagsLoading = tagModalType === 'nose' ? noseTagsLoading : tasteTagsLoading;
  const tagModalTitle = tagModalType === 'nose' ? '향 태그' : '맛 태그';

  // AI 분석 버튼 핸들러
  const handleAiAnalyze = async () => {
    if (!memo.trim()) {
      setAiError('메모를 먼저 입력해주세요.');
      return;
    }
    setAiAnalyzing(true);
    setAiError('');  // 이전 에러 초기화
    try {
      const result = await analyzeNoteByAi(memo);

      // 점수 자동 채움 (null이면 0으로 처리)
      setScores({
        bodyScore:   result.scores.body   ?? 0,
        finishScore: result.scores.finish ?? 0,
        smokyScore:  result.scores.smoky  ?? 0,
        spicyScore:  result.scores.spicy  ?? 0,
        sweetScore:  result.scores.sweet  ?? 0,
      });

      // 태그 자동 선택 (기존 선택에 병합)
      const aiTagIds = [...result.noseTagIds, ...result.palateTagIds];
      setSelectedTagIds((prev) => [...new Set([...prev, ...aiTagIds])]);

      toast('AI 분석이 완료되었습니다.', 'success');
    } catch (err: unknown) {
      // 에러 화면으로 이동하지 않고 인라인 메시지로만 표시
      // 작성 중인 내용(memo, scores, tags)은 그대로 유지
      const message = err instanceof Error ? err.message : 'AI 분석에 실패했습니다.';
      setAiError(`✨ AI 분석 실패: ${message} 잠시 후 다시 시도해주세요.`);
    } finally {
      setAiAnalyzing(false);
    }
  };

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

  const metaLine = whiskey
    ? [
        formatType(whiskey.type),
        whiskey.country,
        whiskey.abv != null ? `${whiskey.abv}%` : null,
        whiskey.volume ? `${whiskey.volume}ml` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : null;
  const imageSrc = resolveMediaUrl(whiskey?.imageUrl);
  const pageTitle = noteLoading ? '노트 확인 중' : isEditMode ? '노트 수정' : '노트 작성';

  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">
        홈 / <Link to={detailPath}>{whiskey?.name ?? '위스키'}</Link> / <strong>{pageTitle}</strong>
      </p>

      <div className="wf-layout-detail-v2 wf-write-review-layout">
        <aside className="wf-detail-sidebar wf-write-review-sidebar">
          <div className="wf-detail-sidebar__image-frame wf-write-review-image-frame">
            <div className="wf-write-review-product">
              <p className="wf-write-review-product__name">{whiskey?.name ?? '위스키 정보를 불러오는 중입니다.'}</p>
              {metaLine ? <p className="wf-write-review-product__meta">{metaLine}</p> : null}
            </div>
            {imageSrc && !imgError ? (
              <img
                src={imageSrc}
                alt={whiskey?.name ?? '위스키'}
                className="wf-detail-sidebar__image wf-write-review-image-frame__image"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="wf-placeholder wf-detail-sidebar__image wf-write-review-image-frame__image" aria-hidden />
            )}
            <span className="wf-detail-sidebar__image-shadow" aria-hidden />
          </div>
        </aside>

        <main className="wf-detail-main wf-write-review-main">
          <form className="wf-detail-reviews wf-write-review-form wf-note-editor" onSubmit={handleSubmit}>
            <div className="wf-detail-reviews__title-row wf-write-review-form__intro">
              <div>
                <h1 className="wf-section-title">{pageTitle}</h1>
                {isEditMode ? (
                  <p className="wf-text-sm wf-write-review-edit-hint">
                    이미 작성한 노트가 있어 수정 화면으로 열었습니다.
                  </p>
                ) : null}
              </div>
            </div>

            <section className="wf-write-review-block wf-note-editor__scores">
              <div className="wf-detail-reviews__title-row wf-write-review-block__head">
                <h2 className="wf-section-title">시음 점수</h2>
              </div>
              <div className="wf-note-editor__scores-layout">
                <div className="wf-note-editor__scores-radar" aria-hidden={false}>
                  <NoteScoreRadar scores={scores} />
                </div>
                <div className="wf-note-editor__scores-controls">
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
                </div>
              </div>
            </section>

            <section className="wf-write-review-block">
              <label className="wf-note-editor__memo-label">
                <div className="wf-note-editor__memo-head">
                  <span className="wf-text-label">메모</span>
                  <button
                    type="button"
                    className="wf-note-editor__ai-btn"
                    disabled={aiAnalyzing || !memo.trim()}
                    onClick={handleAiAnalyze}
                  >
                    {aiAnalyzing ? '분석 중...' : 'AI 분석'}
                  </button>
                </div>
                <textarea
                  className="wf-review-textarea"
                  value={memo}
                  onChange={(event) => {
                    setMemo(event.target.value);
                    if (aiError) setAiError('');
                  }}
                  rows={6}
                  placeholder="향, 맛, 피니시, 마신 상황 등을 자유롭게 기록하세요. 메모 작성 후 AI 분석을 누르면 점수와 태그를 자동으로 채워드립니다."
                />
                {aiError ? <p className="wf-note-editor__ai-error">{aiError}</p> : null}
              </label>
            </section>

            <section className="wf-write-review-block wf-note-editor__tags">
              <div className="wf-detail-reviews__title-row wf-write-review-block__head">
                <h2 className="wf-section-title">태그</h2>
              </div>
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

            {errorMessage ? (
              <p className="wf-text-sm wf-note-editor__error">{errorMessage}</p>
            ) : null}

            <div className="wf-detail-reviews__actions wf-write-review-actions wf-note-editor__actions">
              <Button type="button" variant="ghost" onClick={() => navigate(exitPath)} disabled={saveMutation.isPending}>
                취소
              </Button>
              {isEditMode ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={deleteMutation.isPending}
                  onClick={async () => {
                    const ok = await confirmToast({ message: '노트를 삭제하시겠습니까?', danger: true });
                    if (ok) {
                      deleteMutation.mutate();
                    }
                  }}
                >
                  {deleteMutation.isPending ? '삭제 중...' : '삭제'}
                </Button>
              ) : null}
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? '저장 중...' : isEditMode ? '수정 저장' : '새 노트 저장'}
              </Button>
            </div>
          </form>
        </main>
      </div>

      {tagModalType ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tagModalTitle}
          className="wf-search-tag-modal wf-note-editor__tag-modal"
          onClick={() => setTagModalType(null)}
        >
          <div
            className="wf-box wf-box--solid wf-search-tag-modal__inner wf-search-tag-modal__inner--glass wf-note-editor__tag-modal-panel"
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
              {currentTagsLoading ? (
                <p className="wf-search-tag-modal__loading">태그 불러오는 중…</p>
              ) : currentTagOptions.length === 0 ? (
                <p className="wf-search-tag-modal__loading">표시할 태그가 없습니다.</p>
              ) : (
                currentTagOptions.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className={`wf-search-tag-option${selected ? ' wf-search-tag-option--selected' : ''}`}
                      onClick={() => setSelectedTagIds((ids) => toggleId(ids, tag.id))}
                    >
                      {tag.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </WireframePage>
  );
}
