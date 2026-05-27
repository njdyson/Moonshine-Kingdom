// Display helpers that translate internal 0-indexed player IDs to the
// 1-indexed labels we show to users ("P1", "Seat 1", etc.). Engine code
// stays 0-indexed because bgio uses string player IDs ("0".."3") throughout.

/** "0" → "1", "1" → "2", etc. */
export function seatNumber(playerID: string | null | undefined): string {
  if (playerID === null || playerID === undefined) return "—";
  const n = Number(playerID);
  if (Number.isNaN(n)) return playerID;
  return String(n + 1);
}

/** "0" → "P1". */
export function seatLabel(playerID: string | null | undefined): string {
  if (playerID === null || playerID === undefined) return "—";
  return "P" + seatNumber(playerID);
}

/** Translate "P0" / "P1" tokens inside arbitrary log text to display-numbered. */
export function formatLogLine(line: string): string {
  return line.replace(/\bP(\d+)\b/g, (_m, n) => "P" + (Number(n) + 1));
}
