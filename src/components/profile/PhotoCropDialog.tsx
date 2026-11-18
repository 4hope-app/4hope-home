'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import Spinner from '../ui/Spinner';
import { buttonClass } from '../ui/buttonClass';
import type { Dictionary } from '@/i18n/utils';
import { PHOTO_DIMENSION, PHOTO_MAX_BYTES } from '@/lib/profile';
import styles from './PhotoCropDialog.module.css';

/** Smallest crop square, in displayed pixels (same as 4hope-webpage). */
const MIN_SIZE = 60;
const KEY_STEP = 10;

type Copy = Dictionary['auth']['profile']['account'];
type Rect = { x: number; y: number; size: number };
type Corner = 'tl' | 'tr' | 'bl' | 'br';

interface Props {
  copy: Copy;
  /** Object URL of the picked file; the dialog is open while it's set. */
  src: string | null;
  closeIcon: ReactNode;
  onCancel: () => void;
  /** The cropped square as a WebP (or JPEG) data URL, PHOTO_DIMENSION px. */
  onDone: (dataUrl: string) => void;
  /** The file isn't an image the browser can read. */
  onInvalid: () => void;
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * Draws the selected square (in displayed px) at PHOTO_DIMENSION and encodes it as WebP, or JPEG
 * where the browser can't encode WebP (Safari), lowering quality until it fits PHOTO_MAX_BYTES.
 */
async function cropToDataUrl(img: HTMLImageElement, rect: Rect): Promise<string | null> {
  const scale = img.naturalWidth / img.clientWidth;
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_DIMENSION;
  canvas.height = PHOTO_DIMENSION;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    img,
    rect.x * scale,
    rect.y * scale,
    rect.size * scale,
    rect.size * scale,
    0,
    0,
    PHOTO_DIMENSION,
    PHOTO_DIMENSION,
  );
  for (const quality of [0.85, 0.7, 0.5]) {
    let blob = await toBlob(canvas, 'image/webp', quality);
    if (blob?.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', quality);
    if (blob && blob.size <= PHOTO_MAX_BYTES) return toDataUrl(blob);
  }
  return null;
}

/**
 * "Customize picture": the picked image with a square crop box that can be dragged and resized
 * from its corners (or moved with the arrow keys and resized with + / −), dimming what's left out.
 */
export default function PhotoCropDialog({
  copy,
  src,
  closeIcon,
  onCancel,
  onDone,
  onInvalid,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [bounds, setBounds] = useState({ w: 0, h: 0 });
  const [rect, setRect] = useState<Rect | null>(null);
  const [busy, setBusy] = useState(false);
  const drag = useRef<{ corner: Corner | null; x: number; y: number; origin: Rect } | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (src && !dialog.open) dialog.showModal();
    if (!src && dialog.open) dialog.close();
  }, [src]);

  const clamp = (r: Rect): Rect => {
    const max = Math.min(bounds.w, bounds.h);
    const size = Math.min(Math.max(r.size, Math.min(MIN_SIZE, max)), max);
    return {
      size,
      x: Math.min(Math.max(r.x, 0), bounds.w - size),
      y: Math.min(Math.max(r.y, 0), bounds.h - size),
    };
  };

  const onLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    const w = img.clientWidth;
    const h = img.clientHeight;
    const size = Math.min(w, h);
    setBounds({ w, h });
    setRect({ x: (w - size) / 2, y: (h - size) / 2, size });
  };

  /** Pointer down on the box (move) or on a corner handle (`data-corner`, resize). */
  const startDrag = (e: PointerEvent<HTMLElement>) => {
    if (!rect) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const corner = (e.currentTarget.dataset.corner as Corner | undefined) ?? null;
    drag.current = { corner, x: e.clientX, y: e.clientY, origin: rect };
  };

  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const { x, y, size } = d.origin;
    if (!d.corner) return setRect(clamp({ size, x: x + dx, y: y + dy }));

    // Resize from a corner, keeping the opposite corner fixed.
    const grow = {
      br: Math.max(dx, dy),
      tl: Math.max(-dx, -dy),
      tr: Math.max(dx, -dy),
      bl: Math.max(-dx, dy),
    }[d.corner];
    const max = Math.min(bounds.w, bounds.h);
    const next = Math.min(Math.max(size + grow, Math.min(MIN_SIZE, max)), max);
    const delta = next - size;
    setRect(
      clamp({
        size: next,
        x: d.corner === 'tl' || d.corner === 'bl' ? x - delta : x,
        y: d.corner === 'tl' || d.corner === 'tr' ? y - delta : y,
      }),
    );
  };

  const endDrag = () => {
    drag.current = null;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!rect) return;
    const move: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    };
    let next: Rect | null = null;
    if (move[e.key]) {
      const [dx, dy] = move[e.key];
      next = { ...rect, x: rect.x + dx, y: rect.y + dy };
    } else if (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_') {
      const delta = e.key === '-' || e.key === '_' ? -KEY_STEP : KEY_STEP;
      // Resize around the center.
      next = { size: rect.size + delta, x: rect.x - delta / 2, y: rect.y - delta / 2 };
    }
    if (!next) return;
    e.preventDefault();
    setRect(clamp(next));
  };

  const onConfirm = async () => {
    const img = imgRef.current;
    if (!img || !rect) return;
    setBusy(true);
    const dataUrl = await cropToDataUrl(img, rect);
    setBusy(false);
    if (dataUrl) onDone(dataUrl);
    else onInvalid();
  };

  const close = () => {
    if (!busy) onCancel();
  };

  const vars = rect
    ? ({
        '--crop-x': `${rect.x}px`,
        '--crop-y': `${rect.y}px`,
        '--crop-size': `${rect.size}px`,
      } as CSSProperties)
    : undefined;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="crop-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div className={styles.head}>
        <h2 id="crop-title" className={styles.title}>
          {copy.cropTitle}
        </h2>
        <button type="button" className={styles.close} aria-label={copy.cropClose} onClick={close}>
          {closeIcon}
        </button>
      </div>

      <div className={styles.body}>
        <div
          className={styles.stage}
          style={vars}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {src && (
            <img
              ref={imgRef}
              className={styles.image}
              src={src}
              alt=""
              draggable={false}
              onLoad={onLoad}
              onError={onInvalid}
            />
          )}
          {rect && (
            <>
              <div className={styles.shade} aria-hidden="true" />
              <div
                className={styles.box}
                role="group"
                tabIndex={0}
                aria-label={copy.cropArea}
                aria-describedby="crop-hint"
                onPointerDown={startDrag}
                onKeyDown={onKeyDown}
              >
                <span className={styles.guides} aria-hidden="true" />
                {(['tl', 'tr', 'bl', 'br'] as Corner[]).map((corner) => (
                  <span
                    key={corner}
                    className={`${styles.handle} ${styles[corner]}`}
                    aria-hidden="true"
                    data-corner={corner}
                    onPointerDown={startDrag}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <p id="crop-hint" className={styles.hint}>
          {`${copy.cropMin} ${copy.cropKeys}`}
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={buttonClass({ variant: 'subtle', size: 'md' })}
          disabled={busy}
          onClick={close}
        >
          {copy.cropCancel}
        </button>
        <button
          type="button"
          className={buttonClass({ size: 'md' })}
          disabled={!rect || busy}
          aria-busy={busy}
          onClick={onConfirm}
        >
          {busy && <Spinner size={16} color="var(--brand-on-gold)" />}
          <span>{copy.cropDone}</span>
        </button>
      </div>
    </dialog>
  );
}
