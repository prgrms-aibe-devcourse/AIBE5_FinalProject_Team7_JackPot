import { apiClient } from '@/shared/api/client';

export interface MyTastingNote {
  id: number;
  whiskeyId: number;
  whiskeyName: string;
  bodyScore: number | null;
  finishScore: number | null;
  smokyScore: number | null;
  spicyScore: number | null;
  sweetScore: number | null;
  memo: string | null;
  tags: TastingNoteTag[];
  draft?: boolean;
  isDraft?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TastingNoteTag {
  id: number;
  category: 'nose' | 'taste' | 'finish';
  name: string;
  imageUrl: string | null;
}

export interface TastingNoteSaveRequest {
  whiskeyId?: number;
  bodyScore: number;
  finishScore: number;
  smokyScore: number;
  spicyScore: number;
  sweetScore: number;
  memo: string;
  isDraft: boolean;
  tagIds: number[];
}

export interface TastingNotePageResponse {
  content: MyTastingNote[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export async function fetchMyTastingNoteForWhiskey(
  whiskeyId: string,
): Promise<MyTastingNote | null> {
  try {
    const { data, status } = await apiClient.get<MyTastingNote>(
      `/whiskeys/${whiskeyId}/notes/my`,
    );
    if (status === 204) return null;
    return data;
  } catch {
    return null;
  }
}

export async function fetchMyTastingNotes(page = 0, size = 10): Promise<TastingNotePageResponse> {
  const { data } = await apiClient.get<TastingNotePageResponse>('/tasting-notes/my', {
    params: { page, size },
  });
  return data;
}

export async function fetchTastingNote(noteId: number): Promise<MyTastingNote> {
  const { data } = await apiClient.get<MyTastingNote>(`/tasting-notes/${noteId}`);
  return data;
}

export async function createTastingNote(
  body: TastingNoteSaveRequest,
): Promise<MyTastingNote> {
  const { data } = await apiClient.post<MyTastingNote>('/tasting-notes', body);
  return data;
}

export async function updateTastingNote(
  noteId: number,
  body: TastingNoteSaveRequest,
): Promise<MyTastingNote> {
  const { data } = await apiClient.patch<MyTastingNote>(`/tasting-notes/${noteId}`, body);
  return data;
}

export async function deleteTastingNote(
  noteId: number,
): Promise<void> {
  await apiClient.delete(`/tasting-notes/${noteId}`);
}

export const noteApi = {
  client: apiClient,
  fetchMyTastingNoteForWhiskey,
  fetchMyTastingNotes,
  fetchTastingNote,
  createTastingNote,
  updateTastingNote,
  deleteTastingNote, // 추가
};
