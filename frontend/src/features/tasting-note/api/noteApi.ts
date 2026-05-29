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

export const noteApi = {
  client: apiClient,
  fetchMyTastingNoteForWhiskey,
  fetchTastingNote,
};
