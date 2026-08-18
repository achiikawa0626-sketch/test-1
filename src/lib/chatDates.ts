export function formatChatDateDivider(value: string) {
  const date = new Date(value);
  if (isSameDay(date, new Date())) return 'Today';
  if (isSameDay(date, addDays(new Date(), -1))) return 'Yesterday';

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function messageDayKey(value: string) {
  return dateDayKey(new Date(value));
}

function dateDayKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function isSameDay(first: Date, second: Date) {
  return dateDayKey(first) === dateDayKey(second);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}
