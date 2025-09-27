const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  IDR: "Rp",
};

export function getCurrencySymbol(currency: string) {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

export function formatCurrency(value: number, currency: string) {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${value.toLocaleString()}`;
}
