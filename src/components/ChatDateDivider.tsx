import { formatChatDateDivider } from '../lib/chatDates';
import type { HomeTranslation } from '../lib/homeTranslations';

type ChatDateDividerProps = {
  date: string;
  text: HomeTranslation;
};

export function ChatDateDivider({ date, text }: ChatDateDividerProps) {
  return (
    <div className="chat-date-divider">
      <time dateTime={date}>
        {formatChatDateDivider(date, {
          locale: text.dateLocale,
          today: text.todayLabel,
          yesterday: text.yesterdayLabel,
        })}
      </time>
    </div>
  );
}
