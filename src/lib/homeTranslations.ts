export type HomeLanguage = 'en' | 'es' | 'ru' | 'fr';

export type HomeTranslation = {
  languageName: string;
  heroTitle: string;
  heroText: string;
  loginButton: string;
  findFamilyButton: string;
  chatButton: string;
};

export const homeLanguages: HomeLanguage[] = ['en', 'es', 'ru', 'fr'];

export const homeTranslations: Record<HomeLanguage, HomeTranslation> = {
  en: {
    languageName: 'English',
    heroTitle: 'Save your family stories before they disappear.',
    heroText:
      'Log in, set up your profile once, connect your family, and keep questions and answers in one private chat.',
    loginButton: 'Log in or create account',
    findFamilyButton: 'Find family',
    chatButton: 'Open chat',
  },
  es: {
    languageName: 'Español',
    heroTitle: 'Guarda las historias de tu familia antes de que desaparezcan.',
    heroText:
      'Inicia sesion, configura tu perfil una vez, conecta con tu familia y guarda preguntas y respuestas en un chat privado.',
    loginButton: 'Iniciar sesion o crear cuenta',
    findFamilyButton: 'Buscar familia',
    chatButton: 'Abrir chat',
  },
  ru: {
    languageName: 'Русский',
    heroTitle: 'Сохраните семейные истории, пока они не исчезли.',
    heroText:
      'Войдите, один раз настройте профиль, подключите семью и храните вопросы и ответы в одном приватном чате.',
    loginButton: 'Войти или создать аккаунт',
    findFamilyButton: 'Найти семью',
    chatButton: 'Открыть чат',
  },
  fr: {
    languageName: 'Français',
    heroTitle: "Gardez les histoires de votre famille avant qu'elles ne disparaissent.",
    heroText:
      'Connectez-vous, configurez votre profil une seule fois, ajoutez votre famille et gardez les questions et réponses dans un chat privé.',
    loginButton: 'Se connecter ou créer un compte',
    findFamilyButton: 'Trouver la famille',
    chatButton: 'Ouvrir le chat',
  },
};
