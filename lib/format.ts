// lib/format.ts
export function safeFormatDate(input?: string | Date | null) {
  try {
    if (!input) return "—";
    const d = input instanceof Date ? input : new Date(input);
    // Invalid Date guard
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  } catch {
    return "—";
  }
}

export function safeFormatCurrency(
  amount: unknown,
  currency: string | undefined,
  fallback: string = "—"
) {
  try {
    const n = typeof amount === "number" ? amount : Number(amount);
    if (!isFinite(n)) return fallback;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(n);
  } catch {
    return fallback;
  }
}

export function safeText(v: unknown, fallback = "—") {
  if (v === null || v === undefined || v === "") return fallback;
  return String(v);
}
