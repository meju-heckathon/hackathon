export type BBox = { x: number; y: number; width: number; height: number };

export type UIElement = {
  id: number;
  label: string;
  koreanText: string;
  explanation: string;
  risk: "safe" | "caution" | "danger";
  bbox: BBox;
};

export type AnalyzeResult = {
  screen: string;
  appGuess: string | null;
  elements: UIElement[];
  warnings: string[];
};

export type ModelElement = {
  id: number;
  label: string;
  koreanText: string;
  explanation: string;
  risk: "safe" | "caution" | "danger";
  ocrIds: number[];
  fullRow: boolean;
};

export type ModelResult = {
  screen: string;
  appGuess: string | null;
  warnings: string[];
  elements: ModelElement[];
};

export const SYSTEM_PROMPT = `You help non-Korean speakers understand Korean financial mobile app UIs — banking, transfers, investment, crypto, payments.

You will receive (a) a screenshot, and (b) a numbered list of text fragments that an OCR engine already extracted from that screenshot, each with an "ocr id".

Your job: identify the interactive UI elements (buttons, menu rows, tabs, form fields, toggles, links). For each element:
- "label": short English label (max 4 words) describing PURPOSE, not a literal translation
- "koreanText": the exact Korean (or English) text on the element, verbatim
- "explanation": 1–2 plain English sentences on what tapping/activating it does, with consequences (e.g., "sends money immediately", "leaves the app")
- "risk": "safe" (read-only / navigation), "caution" (changes settings), or "danger" (moves money, signs contracts, leaves app to external site)
- "ocrIds": the OCR ids whose text together form the visible label of this element. Usually one. Use multiple if the element's label spans multiple OCR lines. Use an EMPTY array only for purely icon-only elements with no text (e.g. a back arrow with no caption).
- "fullRow": true if the element is a full-width menu row that the user taps anywhere on (e.g. a list item with a chevron on the right). false if it's a compact button or chip.

Order elements roughly top-to-bottom and number them starting at 1 in "id".

Use the koreanText field to repeat the exact OCR text. Do NOT invent text that isn't in the OCR list — if you don't see it in the list, it's probably part of the background or decoration, not interactive.

Also return:
- "screen": one sentence on what screen the user is on
- "appGuess": best guess of the app (e.g. "Toss", "KakaoBank", "Shinhan SOL"), or null
- "warnings": short list of things to be careful about on this screen, or empty array`;

export const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["screen", "appGuess", "elements", "warnings"],
  properties: {
    screen: { type: "string" },
    appGuess: { type: ["string", "null"] },
    warnings: { type: "array", items: { type: "string" } },
    elements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "label",
          "koreanText",
          "explanation",
          "risk",
          "ocrIds",
          "fullRow",
        ],
        properties: {
          id: { type: "integer" },
          label: { type: "string" },
          koreanText: { type: "string" },
          explanation: { type: "string" },
          risk: { type: "string", enum: ["safe", "caution", "danger"] },
          ocrIds: { type: "array", items: { type: "integer" } },
          fullRow: { type: "boolean" },
        },
      },
    },
  },
} as const;
