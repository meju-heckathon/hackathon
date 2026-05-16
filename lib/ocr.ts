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

  const lines: OcrLine[] = [];
  let id = 0;
  for (const block of result.data.blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        const text = line.text.trim();
        if (!text) continue;
        if (line.confidence < 30) continue;
        const { x0, y0, x1, y1 } = line.bbox;
        lines.push({
          id: id++,
          text,
          confidence: line.confidence,
          bbox: {
            x: x0 / imgWidth,
            y: y0 / imgHeight,
            width: (x1 - x0) / imgWidth,
            height: (y1 - y0) / imgHeight,
          },
        });
      }
    }
  }
  return lines;
}
