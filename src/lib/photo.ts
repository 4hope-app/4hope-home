/**
 * Server-side profile photo handling. The photo is stored in the profile document as bytes at
 * `photo.currentBytes` (+ `photo.contentType`), the same field 4hope-webpage reads, so a photo set
 * in either app shows in both. The browser crops and re-encodes it (no `sharp` on Workers).
 */
import type { DocumentData } from 'firebase-admin/firestore';
import { PHOTO_MAX_BYTES } from './profile';

const TYPES = ['image/webp', 'image/jpeg', 'image/png'] as const;
type PhotoType = (typeof TYPES)[number];

/** Checks the file signature, so the declared type can't be used to store other content. */
function matchesType(bytes: Buffer, type: PhotoType): boolean {
  if (type === 'image/png')
    return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
}

/** A `data:image/…;base64,…` URL → bytes, or null when it isn't a small WebP/JPEG/PNG. */
export function parsePhotoDataUrl(
  value: unknown,
): { bytes: Buffer; contentType: PhotoType } | null {
  if (typeof value !== 'string') return null;
  const match = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/.exec(value);
  if (!match) return null;
  const contentType = match[1] as PhotoType;
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length === 0 || bytes.length > PHOTO_MAX_BYTES) return null;
  return matchesType(bytes, contentType) ? { bytes, contentType } : null;
}

/** The uploaded photo's bytes and type, or null when the user hasn't uploaded one. */
export function profilePhoto(
  profile: DocumentData,
): { bytes: Buffer; contentType: PhotoType } | null {
  const bytes: unknown = profile.photo?.currentBytes;
  if (!Buffer.isBuffer(bytes)) return null;
  return {
    bytes,
    contentType: TYPES.find((t) => t === profile.photo?.contentType) ?? 'image/webp',
  };
}

/** The uploaded photo as a data URL, or null. */
export function profilePhotoSrc(profile: DocumentData): string | null {
  const photo = profilePhoto(profile);
  return photo ? `data:${photo.contentType};base64,${photo.bytes.toString('base64')}` : null;
}
