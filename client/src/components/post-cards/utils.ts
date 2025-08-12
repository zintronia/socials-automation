export const buildISOFromDateTime = (date?: Date | null, time?: string | null): string | null => {
  if (!date) return null;
  const [h, m] = (time || "00:00").split(":").map((v) => parseInt(v || "0", 10));
  const d = new Date(date);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
};

export const formatISOForDisplay = (iso?: string | null): string => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return String(iso);
  }
};
