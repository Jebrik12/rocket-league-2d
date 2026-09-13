import { GifEncoder } from "./gifEncoder";

/**
 * Universal Clip Exporter for Rocket League 2D
 * Exports selected replay ranges to MP4 (via MediaRecorder) or animated GIF (via GifEncoder).
 */

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

function getBestVideoMimeType(): { mimeType: string; extension: string } {
  const types = [
    { mime: "video/mp4;codecs=avc1.42E01E,mp4a.40.2", ext: "mp4" },
    { mime: "video/mp4", ext: "mp4" },
    { mime: "video/webm;codecs=vp9", ext: "webm" },
    { mime: "video/webm;codecs=vp8", ext: "webm" },
    { mime: "video/webm", ext: "webm" }
  ];

  for (const t of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t.mime)) {
      return { mimeType: t.mime, extension: t.ext };
    }
  }

  return { mimeType: "video/webm", extension: "webm" };
}

export interface ExportOptions {
  snapshots: any[];
  renderFrame: (ctx: CanvasRenderingContext2D, snap: any) => void;
  width?: number;
  height?: number;
  fps?: number;
  onProgress?: (pct: number, statusText: string) => void;
  signal?: AbortSignal;
}

/**
 * Export selected replay frames to MP4 (or WebM if MP4 is unsupported by browser)
 */
export async function exportClipAsVideo(options: ExportOptions): Promise<void> {
  const {
    snapshots,
    renderFrame,
    width = 1280,
    height = 704,
    fps = 30,
    onProgress,
    signal
  } = options;

  if (!snapshots || snapshots.length === 0) {
    throw new Error("No replay frames to export.");
  }

  const { mimeType, extension } = getBestVideoMimeType();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: false });
  if (!ctx) throw new Error("Could not create 2D canvas context.");

  // Prepare MediaRecorder stream
  const stream = canvas.captureStream(fps);
  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5_000_000
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  recorder.start();

  const totalFrames = snapshots.length;
  const frameIntervalMs = 1000 / fps;

  // Render each snapshot frame sequentially
  for (let i = 0; i < totalFrames; i++) {
    if (signal?.aborted) {
      recorder.stop();
      throw new Error("Export cancelled.");
    }

    renderFrame(ctx, snapshots[i]);

    if (onProgress) {
      const pct = Math.round(((i + 1) / totalFrames) * 95);
      onProgress(pct, `Recording video frame ${i + 1}/${totalFrames}...`);
    }

    // Yield to allow MediaRecorder to process canvas frame
    await new Promise((r) => setTimeout(r, frameIntervalMs));
  }

  // Stop recording and wait for final blob
  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      try {
        const blob = new Blob(chunks, { type: mimeType });
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const filename = `rocket_league_clip_${timestamp}.${extension}`;
        downloadBlob(blob, filename);
        if (onProgress) onProgress(100, "Download started!");
        resolve();
      } catch (err) {
        reject(err);
      }
    };

    recorder.stop();
  });
}

/**
 * Export selected replay frames to Animated GIF (256-color GIF89a)
 */
export async function exportClipAsGif(options: ExportOptions): Promise<void> {
  const {
    snapshots,
    renderFrame,
    width = 640,
    height = 352,
    fps = 20,
    onProgress,
    signal
  } = options;

  if (!snapshots || snapshots.length === 0) {
    throw new Error("No replay frames to export.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not create 2D canvas context.");

  const delayMs = Math.round(1000 / fps);
  const encoder = new GifEncoder(width, height, 0);

  // Subsample snapshots to match target fps
  const totalSnapshots = snapshots.length;
  const targetDurationSec = (snapshots[totalSnapshots - 1].time - snapshots[0].time) / 1000;
  const totalTargetFrames = Math.max(3, Math.min(300, Math.round(targetDurationSec * fps)));
  const step = Math.max(1, (totalSnapshots - 1) / (totalTargetFrames - 1));

  for (let f = 0; f < totalTargetFrames; f++) {
    if (signal?.aborted) throw new Error("Export cancelled.");

    const snapIdx = Math.min(totalSnapshots - 1, Math.round(f * step));
    renderFrame(ctx, snapshots[snapIdx]);

    const imgData = ctx.getImageData(0, 0, width, height);
    encoder.addFrame(imgData, delayMs);

    if (onProgress) {
      const pct = Math.round(((f + 1) / totalTargetFrames) * 50);
      onProgress(pct, `Capturing GIF frame ${f + 1}/${totalTargetFrames}...`);
    }

    // Yield periodically
    if (f % 4 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  if (onProgress) onProgress(55, "Quantizing colors and building GIF...");

  // Build GIF with progress reporting for compression
  const blob = encoder.build((encodePct) => {
    if (onProgress) {
      const pct = 50 + Math.round(encodePct * 0.48);
      onProgress(pct, `Encoding GIF: ${encodePct}%...`);
    }
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  downloadBlob(blob, `rocket_league_clip_${timestamp}.gif`);

  if (onProgress) onProgress(100, "GIF Download ready!");
}
