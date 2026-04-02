const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function isIsoDate(value?: string) {
  if (!value) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

export function isOverdue(value?: string) {
  if (!isIsoDate(value)) {
    return false;
  }

  return new Date(value as string).getTime() < Date.now();
}

export function isDueToday(value?: string) {
  if (!isIsoDate(value)) {
    return false;
  }

  const date = new Date(value as string);
  const today = new Date();

  return date.toDateString() === today.toDateString();
}

export function isDueThisWeek(value?: string) {
  if (!isIsoDate(value)) {
    return false;
  }

  const now = new Date();
  const date = new Date(value as string);
  const diff = date.getTime() - now.getTime();

  return diff >= 0 && diff <= 7 * DAY_IN_MS;
}
