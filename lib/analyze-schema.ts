export type BBox = { x: number; y: number; width: number; height: number };

export type UIElement = {
  id: number;
  label: string;
  koreanText: string;
  explanation: string;
  termGloss: string | null;
  risk: "safe" | "caution" | "danger";
  bbox: BBox;
};

export type GoalAnswer = {
  goal: string;
  found: boolean;
  elementId: number | null;
  rationale: string;
};

export type AnalyzeResult = {
  screen: string;
  appGuess: string | null;
  elements: UIElement[];
  warnings: string[];
  goalAnswer: GoalAnswer | null;
};

export type ModelElement = {
  id: number;
  label: string;
  koreanText: string;
  explanation: string;
  termGloss: string | null;
  risk: "safe" | "caution" | "danger";
  ocrIds: number[];
  fullRow: boolean;
};

export type ModelResult = {
  screen: string;
  appGuess: string | null;
  warnings: string[];
  elements: ModelElement[];
  goalAnswer: {
    found: boolean;
    elementId: number | null;
    rationale: string;
  } | null;
};

export const SYSTEM_PROMPT = `You help non-Korean speakers understand Korean financial mobile app UIs — banking, transfers, investment, crypto, payments. You are a financial-domain expert: assume the user has never heard of Korean finance concepts.

You will receive (a) a screenshot, and (b) a numbered list of text fragments that an OCR engine already extracted from that screenshot, each with an "ocr id".

Your job: identify the interactive UI elements (buttons, menu rows, tabs, form fields, toggles, links). For each element:
- "label": short English label (max 4 words) describing PURPOSE, not a literal translation
- "koreanText": the exact Korean (or English) text on the element, verbatim
- "explanation": 1–2 plain English sentences on what tapping/activating it does, with concrete consequences (e.g., "sends money immediately", "leaves the app to open the bank's site").
- "termGloss": If the Korean (or English) label refers to a financial product, service, or concept that an English-speaking foreigner is unlikely to know (e.g. 신탁/Trust, 청약/subscription savings, ISA, 외환/foreign exchange, 펀드/fund, 적금/installment savings, 마이너스통장/overdraft account, 신용대출/credit loan, 보이스피싱/voice phishing, 공동인증서/joint certificate, 자동이체/standing order, 인증/authentication), give a 1–2 sentence definition of WHAT THE TERM ACTUALLY IS in everyday English, written so a complete beginner understands. Do NOT just translate the word. If the label is a generic verb or universally understood action (Login, Cancel, Next, Confirm, Settings, Search, Notifications, Menu), set termGloss to null. Be generous about explaining — when in doubt, define.
- "risk": "safe" (read-only / navigation), "caution" (changes settings, requires confirmation), or "danger" (moves money, signs contracts, deletes data, leaves the app to an external site)
- "ocrIds": the OCR ids whose text fragments together form the visible label of this element. The OCR splits text by visual gaps, so a single button's label may be one id or several adjacent ids. Pick the SMALLEST set whose combined text matches the label you describe in koreanText — do NOT include nearby ids that belong to a different element. CRITICAL: all ocrIds you pick for one element must sit on essentially the same visual line (similar y-coordinate). If two text fragments are stacked vertically (e.g. one above the other in a grid cell), they belong to DIFFERENT elements; never merge them into a single element. Use an EMPTY array only for purely icon-only elements with no text.
- "fullRow": true if the element is a full-width menu row the user taps anywhere on (e.g. a list item with a chevron on the right). false if it's a compact button or chip.

Order elements roughly top-to-bottom and number them starting at 1 in "id".

Use the koreanText field to repeat the exact OCR text. Do NOT invent text that isn't in the OCR list — if you don't see it in the list, it's probably background or decoration, not interactive.

Also return:
- "screen": one sentence on what screen the user is on. If the screen revolves around a domain-specific concept, include a quick definition (e.g. "Trust (신탁) products — letting a bank manage your assets for you").
- "appGuess": best guess of the app (e.g. "Toss", "KakaoBank", "Shinhan SOL"), or null
- "warnings": short list of things to be careful about on this screen, or empty array. Plain English, beginner-friendly.
- "goalAnswer": If — and ONLY if — the user message tells you a specific goal the user is trying to accomplish, return an object: { found: boolean, elementId: integer or null, rationale: string }. Set found=true and elementId to the id of the single element they should tap next to make progress toward that goal; rationale is 1–2 sentences explaining WHY that's the right tap. If no element on this screen helps with that goal, set found=false, elementId=null, and rationale a 1–2 sentence honest answer like "This screen doesn't have a way to do X — try going back to the home screen and looking for a 이체 button." If no goal was given in the user message, return null for goalAnswer.`;

export const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["screen", "appGuess", "elements", "warnings", "goalAnswer"],
  properties: {
    screen: { type: "string" },
    appGuess: { type: ["string", "null"] },
    warnings: { type: "array", items: { type: "string" } },
    goalAnswer: {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["found", "elementId", "rationale"],
      properties: {
        found: { type: "boolean" },
        elementId: { type: ["integer", "null"] },
        rationale: { type: "string" },
      },
    },
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
          "termGloss",
          "risk",
          "ocrIds",
          "fullRow",
        ],
        properties: {
          id: { type: "integer" },
          label: { type: "string" },
          koreanText: { type: "string" },
          explanation: { type: "string" },
          termGloss: { type: ["string", "null"] },
          risk: { type: "string", enum: ["safe", "caution", "danger"] },
          ocrIds: { type: "array", items: { type: "integer" } },
          fullRow: { type: "boolean" },
        },
      },
    },
  },
} as const;
