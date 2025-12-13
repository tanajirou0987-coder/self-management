const APP_TIME_ZONE = "Asia/Tokyo";

const isoFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const numericFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIME_ZONE,
  weekday: "short",
});

const getPart = (parts: Intl.DateTimeFormatPart[], type: string) =>
  parts.find((part) => part.type === type)?.value ?? "";

export const getCurrentAppDate = () => isoFormatter.format(new Date());

export const formatIsoDateForDisplay = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  if ([year, month, day].some((value) => Number.isNaN(value))) {
    return isoDate;
  }

  const zonedDate = new Date(Date.UTC(year, month - 1, day));
  const parts = numericFormatter.formatToParts(zonedDate);
  const weekday = weekdayFormatter.format(zonedDate);

  return `${getPart(parts, "year")}年 ${getPart(parts, "month")}月${getPart(
    parts,
    "day",
  )}日 (${weekday})`;
};
