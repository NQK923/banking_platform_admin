/**
 * Safely formats a decimal value for display without doing floating-point
 * arithmetic. The backend contract is decimal-as-string, but some local JSON
 * responses may still arrive as numbers; those are stringified for display only.
 */
export function formatMoney(amount: string | number | null | undefined, currency: string = "VND"): string {
  if (amount === null || amount === undefined || amount === "") return "0";
  if (typeof amount !== "string" && typeof amount !== "number") return "0";

  const amountStr = String(amount);
  
  const isNegative = amountStr.startsWith("-");
  const cleanStr = amountStr.replace(/^-/, "");
  
  const parts = cleanStr.split(".");
  const integerPart = parts[0];
  let fractionalPart = parts[1] || "";
  
  // Format integer part with commas
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Depending on currency, we might want to trim trailing zeros in fractional part or force 2 decimals
  // Assuming the backend provides exact precision string, we'll display it as is, trimming trailing zeros if any.
  fractionalPart = fractionalPart.replace(/0+$/, "");
  
  let formattedValue = formattedInteger;
  if (fractionalPart.length > 0) {
    formattedValue += `.${fractionalPart}`;
  }
  
  return `${isNegative ? "-" : ""}${formattedValue} ${currency}`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "0";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export function formatRelativeDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const divisions: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" },
  ];

  let duration = seconds;
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }).format(
        Math.round(duration),
        division.unit
      );
    }
    duration /= division.amount;
  }

  return formatDate(dateString);
}
