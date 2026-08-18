import { formatChatDateDivider } from '../lib/chatDates';

type ChatDateDividerProps = {
  date: string;
};

export function ChatDateDivider({ date }: ChatDateDividerProps) {
  return (
    <div className="chat-date-divider">
      <time dateTime={date}>{formatChatDateDivider(date)}</time>
    </div>
  );
}
