export type WaitEntry = {
  restaurantId: string;
  name: string;
  phone: string;
  partySize: number;
  position: number;
  estimatedMinutes: number;
  createdAt: number;
};

const KEY = "korea-wait:entries";

export function readEntries(): WaitEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WaitEntry[]) : [];
  } catch {
    return [];
  }
}

export function writeEntries(entries: WaitEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(entries));
}

export function upsertEntry(entry: WaitEntry) {
  const existing = readEntries().filter(
    (e) => e.restaurantId !== entry.restaurantId,
  );
  writeEntries([entry, ...existing]);
}

export function removeEntry(restaurantId: string) {
  writeEntries(readEntries().filter((e) => e.restaurantId !== restaurantId));
}
