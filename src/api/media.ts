import { mediaClient } from './client';
import { UploadedMedia } from '@/types';

export interface PickedImage {
  uri: string;
  // Inferred from picker asset; defaults applied below.
  fileName?: string | null;
  mimeType?: string | null;
}

/**
 * Uploads a single image to the Media Service as multipart/form-data and
 * returns the persisted media record. `onProgress` reports 0..1.
 *
 * React Native's FormData accepts the { uri, name, type } object form for file
 * parts; we cast to satisfy the DOM-typed FormData signature.
 */
export async function uploadImage(
  image: PickedImage,
  onProgress?: (fraction: number) => void,
): Promise<UploadedMedia> {
  const form = new FormData();
  const name = image.fileName ?? `upload-${Date.now()}.jpg`;
  const type = image.mimeType ?? 'image/jpeg';

  form.append('file', {
    uri: image.uri,
    name,
    type,
  } as unknown as Blob);

  // Media Service: POST /media/upload (field "file") -> { id, urls: {thumb,medium,full} }.
  const res = await mediaClient.post<{ id: string; urls?: Record<string, string> }>(
    '/media/upload',
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(e.loaded / e.total);
        }
      },
    },
  );
  const urls = res.data.urls ?? {};
  return { id: res.data.id, url: urls.medium ?? urls.full ?? urls.thumb ?? '' };
}

export async function uploadImages(
  images: PickedImage[],
  onProgress?: (fraction: number) => void,
): Promise<UploadedMedia[]> {
  const results: UploadedMedia[] = [];
  for (let i = 0; i < images.length; i += 1) {
    const image = images[i];
    if (!image) continue;
    const uploaded = await uploadImage(image, (f) => {
      // Aggregate progress across the batch.
      if (onProgress) onProgress((i + f) / images.length);
    });
    results.push(uploaded);
  }
  return results;
}
