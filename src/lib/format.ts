export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// SQLite's CURRENT_TIMESTAMP returns "YYYY-MM-DD HH:MM:SS" in UTC without a
// timezone suffix. Normalize it so Date() parses it as UTC instead of local
// time, then let the browser/server render it in pt-BR local time.
function toDate(value: string | Date) {
  if (value instanceof Date) return value;
  const normalized =
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
      ? `${value.replace(" ", "T")}Z`
      : value;
  return new Date(normalized);
}

export function formatDate(value: string | Date) {
  return toDate(value).toLocaleDateString("pt-BR");
}

export function formatDateTime(value: string | Date) {
  return toDate(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatTime(value: string | Date) {
  return toDate(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Formats a plain YYYY-MM-DD date string without timezone conversion.
export function formatDateOnly(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}
