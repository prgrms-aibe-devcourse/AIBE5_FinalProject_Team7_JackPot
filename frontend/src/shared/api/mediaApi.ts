import { apiClient } from './client';
import { unwrapApiData } from '@/shared/api/types/response';

export type MediaPurpose = 'WHISKEY' | 'POST' | 'PROFILE';

export interface PresignUploadRequest {
  purpose: MediaPurpose;
  contentType: string;
  fileName?: string;
}

export interface PresignUploadResponse {
  uploadUrl: string;
  objectKey: string;
  mediaUrl: string;
}

export async function requestPresignedUpload(
  body: PresignUploadRequest,
): Promise<PresignUploadResponse> {
  const res = await apiClient.post('/uploads/presign', body);
  return unwrapApiData<PresignUploadResponse>(res.data);
}

/** presigned URL 로 S3 에 직접 PUT */
export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error('이미지 업로드에 실패했습니다.');
  }
}

/** presign → S3 PUT → mediaUrl 반환 */
export async function uploadImage(
  file: File,
  purpose: MediaPurpose,
): Promise<PresignUploadResponse> {
  const presign = await requestPresignedUpload({
    purpose,
    contentType: file.type,
    fileName: file.name,
  });
  await uploadFileToS3(presign.uploadUrl, file);
  return presign;
}
