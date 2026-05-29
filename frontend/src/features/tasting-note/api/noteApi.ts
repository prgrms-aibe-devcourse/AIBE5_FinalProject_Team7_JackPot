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
  draft: boolean;
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

export async function fetchMyTastingNoteForWhiskey(
  userId: number,
  whiskeyId: string,
): Promise<MyTastingNote | null> {
  try {
    const { data, status } = await apiClient.get<MyTastingNote>(
      `/whiskeys/${whiskeyId}/notes/my`,
      { params: { userId } },
    );
    if (status === 204) return null;
    return data;
  } catch {
    return null;
  }
}

export async function fetchTastingNote(noteId: number): Promise<MyTastingNote> {
  const { data } = await apiClient.get<MyTastingNote>(`/tasting-notes/${noteId}`);
  return data;
}

export async function createTastingNote(
  userId: number,
  body: TastingNoteSaveRequest,
): Promise<MyTastingNote> {
  const { data } = await apiClient.post<MyTastingNote>('/tasting-notes', body, {
    params: { userId },
  });
  return data;
}

export async function updateTastingNote(
  userId: number,
  noteId: number,
  body: TastingNoteSaveRequest,
): Promise<MyTastingNote> {
  const { data } = await apiClient.patch<MyTastingNote>(`/tasting-notes/${noteId}`, body, {
    params: { userId },
  });
  return data;
}

export const noteApi = {
  client: apiClient,
  fetchMyTastingNoteForWhiskey,
  fetchTastingNote,
  createTastingNote,
  updateTastingNote,
};
