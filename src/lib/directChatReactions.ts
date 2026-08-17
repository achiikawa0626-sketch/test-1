const localReactionKey = 'ask-grandma-direct-chat-reactions';

export async function loadDirectChatReactions(messageIds: string[]) {
  if (messageIds.length === 0) return {};
  const savedReactions = readSavedReactions();

  return messageIds.reduce<Record<string, string>>((reactions, messageId) => {
    const reaction = savedReactions[messageId];
    if (reaction) reactions[messageId] = reaction;
    return reactions;
  }, {});
}

export async function saveDirectChatReaction(messageId: string, reaction: string) {
  localStorage.setItem(
    localReactionKey,
    JSON.stringify({
      ...readSavedReactions(),
      [messageId]: reaction,
    }),
  );
}

function readSavedReactions() {
  try {
    return JSON.parse(localStorage.getItem(localReactionKey) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}
