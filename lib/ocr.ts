import { createWorker, type Worker } from "tesseract.js";

export type OcrLine = {
  id: number;
  text: string;
  bbox: { x: number; y: number; width: number; height: number };
  confidence: number;
};

let workerPromise: Promise<Worker> | null = null;

function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker(["kor", "eng"]).catch((err) => {
      workerPromise = null;
      throw err;
    });
  }
  return workerPromise;
}

type Word = {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
};

function mergeAdjacentWords(words: Word[]): Word[] {
  // Merge words on the same baseline whose horizontal gap is small
  // (typical for Korean tokens split by tesseract or English multi-word labels).
  // Words separated by a larger gap (different UI elements) stay independent.
  if (words.length === 0) return [];
  const sorted = [...words].sort(
    (a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0,
  );
  const merged: Word[] = [];
  for (const w of sorted) {
    const last = merged[merged.length - 1];
    if (!last) {
      merged.push(w);
      continue;
    }
    const lastH = last.bbox.y1 - last.bbox.y0;
    const wH = w.bbox.y1 - w.bbox.y0;
    const avgH = (lastH + wH) / 2;
    const sameLine =
      Math.abs(last.bbox.y0 - w.bbox.y0) < avgH * 0.5 &&
      Math.abs(last.bbox.y1 - w.bbox.y1) < avgH * 0.5;
    const gap = w.bbox.x0 - last.bbox.x1;
    // Merge only when the gap is smaller than ~0.6 char-heights
    // (i.e. a normal inter-word space). Wider gaps stay separate.
    if (sameLine && gap >= 0 && gap < avgH * 0.6) {
      last.text = `${last.text} ${w.text}`;
      last.confidence = (last.confidence + w.confidence) / 2;
      last.bbox = {
        x0: Math.min(last.bbox.x0, w.bbox.x0),
        y0: Math.min(last.bbox.y0, w.bbox.y0),
        x1: Math.max(last.bbox.x1, w.bbox.x1),
        y1: Math.max(last.bbox.y1, w.bbox.y1),
      };
    } else {
      merged.push(w);
    }
  }
  return merged;
}

export async function ocrImage(
  buffer: Buffer,
  imgWidth: number,
  imgHeight: number,
): Promise<OcrLine[]> {
  const worker = await getWorker();
  const result = await worker.recognize(
    buffer,
    {},
    { blocks: true, text: false, hocr: false, tsv: false },
  );

  const words: Word[] = [];
  for (const block of result.data.blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        for (const word of line.words ?? []) {
          const text = word.text.trim();
          if (!text) continue;
          if (word.confidence < 25) continue;
          words.push({
            text,
            confidence: word.confidence,
            bbox: word.bbox,
          });
        }
      }
    }
  }

  const merged = mergeAdjacentWords(words);

  return merged.map((w, id) => ({
    id,
    text: w.text,
    confidence: w.confidence,
    bbox: {
      x: w.bbox.x0 / imgWidth,
      y: w.bbox.y0 / imgHeight,
      width: (w.bbox.x1 - w.bbox.x0) / imgWidth,
      height: (w.bbox.y1 - w.bbox.y0) / imgHeight,
    },
  }));
}
