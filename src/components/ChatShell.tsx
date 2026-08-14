import { Link } from 'wouter';
import { Auth } from './Auth';
import { ChatComposer } from './ChatComposer';
import { ChatMessages } from './ChatMessages';
import type { AccountMode } from '../lib/accountMode';
import type { ChatMediaType, ChatMessage } from '../lib/chat';
import type { FamilyProfile } from '../lib/familyConnections';

type ChatShellProps = {
  mode: AccountMode;
  contacts: FamilyProfile[];
  activeContact?: FamilyProfile;
  messages: ChatMessage[];
  message: string;
  initialText: string;
  isAuthReady: boolean;
  isLoggedIn: boolean;
  onContactChange: (contact: FamilyProfile) => void;
  onRefresh: () => void;
  onSendText: (text: string) => Promise<void>;
  onSendMedia: (blob: Blob, mediaType: ChatMediaType) => Promise<void>;
};

export function ChatShell(props: ChatShellProps) {
  const storyText = props.messages
    .map((item) => `${item.senderRole}: ${item.body}`)
    .filter((line) => line.trim().length > 0)
    .join('\n');

  return (
    <section className="chat-shell">
      {!props.isAuthReady ? <ChatEmpty text="Checking your login..." /> : null}
      {props.isAuthReady && !props.isLoggedIn ? <ChatLogin /> : null}
      {props.isAuthReady && props.isLoggedIn ? (
        <ChatReady {...props} storyText={storyText} />
      ) : null}
    </section>
  );
}

function ChatReady(props: ChatShellProps & { storyText: string }) {
  return (
    <>
      <ContactStrip {...props} />
      {props.message && <p className="message">{props.message}</p>}
      {props.activeContact ? (
        <>
          <div className="chat-active-bar">
            <span>Chatting with {props.activeContact.displayName}</span>
            <button className="ghost small" type="button" onClick={props.onRefresh}>
              Refresh
            </button>
          </div>
          <ChatMessages messages={props.messages} />
          <ChatComposer
            mode={props.mode}
            storyText={props.storyText}
            initialText={props.initialText}
            onSendText={props.onSendText}
            onSendMedia={props.onSendMedia}
          />
        </>
      ) : (
        <ChatEmpty
          text="No accepted family chat yet."
          help="Open family requests and tap Chat next to a connected person."
        />
      )}
    </>
  );
}

function ContactStrip(props: ChatShellProps) {
  return (
    <div className="chat-contact-strip">
      {props.contacts.length === 0 ? (
        <Link className="text-button" href="/find-family">Find family</Link>
      ) : (
        props.contacts.map((contact) => (
          <button
            className={props.activeContact?.id === contact.id ? 'chat-contact active' : 'chat-contact'}
            key={contact.id}
            type="button"
            onClick={() => props.onContactChange(contact)}
          >
            {contact.displayName}
          </button>
        ))
      )}
    </div>
  );
}

function ChatLogin() {
  return (
    <div className="chat-login-panel">
      <div>
        <p>Log in before chat.</p>
        <span>Use Google or email first, then connect your family.</span>
      </div>
      <Auth />
    </div>
  );
}

function ChatEmpty({ text, help }: { text: string; help?: string }) {
  return (
    <div className="chat-empty">
      <p>{text}</p>
      {help && <span>{help}</span>}
      {help && <Link className="text-button" href="/find-family">Find family</Link>}
    </div>
  );
}
