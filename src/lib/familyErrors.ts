export function friendlyFamilyError(message: string) {
  const lowerMessage = message.toLowerCase();
  const isMissingProfiles =
    lowerMessage.includes('could not find the table') ||
    lowerMessage.includes('profiles') ||
    lowerMessage.includes('family_requests') ||
    lowerMessage.includes('search_profiles') ||
    lowerMessage.includes('recent_profiles');

  if (isMissingProfiles) {
    return new Error('Supabase family tables are missing. Run npm run db:push -- --yes first.');
  }

  return new Error(message);
}
