export function isMissingSupabaseResource(message: string) {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('could not find the table') ||
    lowerMessage.includes('schema cache') ||
    lowerMessage.includes('404') ||
    lowerMessage.includes('not found')
  );
}
