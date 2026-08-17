type ChatLoadingProps = {
  text: string;
};

export function ChatLoading({ text }: ChatLoadingProps) {
  return (
    <div className="chat-loading" role="status" aria-live="polite">
      <span className="chat-loading__spinner" />
      <p>{text}</p>
      <div className="chat-loading__bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
