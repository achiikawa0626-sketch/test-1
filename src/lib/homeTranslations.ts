export type HomeLanguage = 'en' | 'es' | 'ru' | 'fr';

export type HomeTranslation = {
  languageName: string;
  heroTitle: string;
  heroText: string;
  loginButton: string;
  findFamilyButton: string;
  chatButton: string;
  authNotLoggedIn: string;
  authKidParent: string;
  authGrandparent: string;
  profileLink: string;
  familyPreviewLabel: string;
  startLabel: string;
  signedOutTitle: string;
  signedOutText: string;
  signedOutButton: string;
  familyReadyTitle: string;
  familyEmptyTitle: string;
  incomingRequestSingle: string;
  incomingRequestMany: (count: number) => string;
  incomingRequestText: string;
  reviewButton: string;
  waitingTitle: string;
  waitingText: string;
  checkStatusButton: string;
  addFamilyTitle: string;
  addFamilyText: string;
  openFamilyChatTitle: string;
  openFamilyChatText: string;
  findFamilyTitle: string;
  findFamilyIntro: string;
  yourRoleTitle: string;
  editProfileLink: string;
  grandmaSearchPlaceholder: string;
  familySearchPlaceholder: string;
  findButton: string;
  peopleFoundTitle: string;
  searchHint: string;
  requestsToAcceptTitle: string;
  loadingRequests: string;
  requestsToAcceptEmpty: string;
  sentRequestsTitle: string;
  loadingSentRequests: string;
  sentRequestsEmpty: string;
  acceptButton: string;
  declineButton: string;
  waitingChip: string;
  cancelButton: string;
  yourFamilyTitle: string;
  acceptedRequestsEmpty: string;
  familyChatButton: string;
  askQuestionsButton: string;
  sendingRequest: string;
  sendRequestButton: string;
  connectedLabel: string;
  waitingForYouLabel: string;
  declinedLabel: string;
  requestSentLabel: string;
  noAccountFound: string;
  couldNotLoadRequests: string;
  couldNotSearchFamily: string;
  familyRequestAccepted: string;
  familyRequestSent: string;
  requestSentDetails: string;
  couldNotSendRequest: string;
  familyRequestDeclined: string;
  couldNotUpdateRequest: string;
  requestCanceled: string;
  couldNotCancelRequest: string;
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
    authNotLoggedIn: 'Not logged in',
    authKidParent: 'Kid/parent',
    authGrandparent: 'Grandparent',
    profileLink: 'Profile',
    familyPreviewLabel: 'Your Family',
    startLabel: 'Start',
    signedOutTitle: 'Your family stories live here.',
    signedOutText:
      'Log in first, then connect with real family accounts and start a private chat.',
    signedOutButton: 'Log in',
    familyReadyTitle: 'People you can chat with now.',
    familyEmptyTitle: 'Build your family circle.',
    incomingRequestSingle: '1 request waiting',
    incomingRequestMany: (count) => `${count} requests waiting`,
    incomingRequestText:
      'Someone wants to connect with you. Review the request and accept it to start chatting.',
    reviewButton: 'Review',
    waitingTitle: 'Waiting for family',
    waitingText: 'Your request was sent. Once they accept, their profile will show up here.',
    checkStatusButton: 'Check status',
    addFamilyTitle: 'Add your first family member',
    addFamilyText: 'Search by email, send a request, and this card becomes your real family hub.',
    openFamilyChatTitle: 'Open your family chat',
    openFamilyChatText:
      'Send messages, voice notes, videos, and questions with the people connected above.',
    findFamilyTitle: 'Family requests',
    findFamilyIntro:
      'Find someone by email or username, send a request, and connect after they accept.',
    yourRoleTitle: 'Your role',
    editProfileLink: 'Edit profile',
    grandmaSearchPlaceholder: "Grandma's email or username",
    familySearchPlaceholder: 'Family email or username',
    findButton: 'Find',
    peopleFoundTitle: 'People you found',
    searchHint: 'Search for the email or username they used when signing up.',
    requestsToAcceptTitle: 'Requests to accept',
    loadingRequests: 'Loading requests...',
    requestsToAcceptEmpty: 'When someone asks to connect, you can accept or decline here.',
    sentRequestsTitle: 'Sent requests',
    loadingSentRequests: 'Loading sent requests...',
    sentRequestsEmpty: 'Requests you send will stay here until the other person answers.',
    acceptButton: 'Accept',
    declineButton: 'Decline',
    waitingChip: 'Waiting',
    cancelButton: 'Cancel',
    yourFamilyTitle: 'Your family',
    acceptedRequestsEmpty: 'Accepted requests will appear here.',
    familyChatButton: 'Chat',
    askQuestionsButton: 'Ask questions',
    sendingRequest: 'Sending...',
    sendRequestButton: 'Send request',
    connectedLabel: 'Connected',
    waitingForYouLabel: 'Waiting for you',
    declinedLabel: 'Declined',
    requestSentLabel: 'Request sent',
    noAccountFound: 'No account found. Check the email or username and try again.',
    couldNotLoadRequests: 'Could not load family requests.',
    couldNotSearchFamily: 'Could not search family.',
    familyRequestAccepted: 'Family request accepted.',
    familyRequestSent: 'Family request sent.',
    requestSentDetails: 'Request sent. It will appear under Sent requests until they accept.',
    couldNotSendRequest: 'Could not send request.',
    familyRequestDeclined: 'Family request declined.',
    couldNotUpdateRequest: 'Could not update request.',
    requestCanceled: 'Request canceled.',
    couldNotCancelRequest: 'Could not cancel request.',
  },
  es: {
    languageName: 'Español',
    heroTitle: 'Guarda las historias de tu familia antes de que desaparezcan.',
    heroText:
      'Inicia sesion, configura tu perfil una vez, conecta con tu familia y guarda preguntas y respuestas en un chat privado.',
    loginButton: 'Iniciar sesión o crear cuenta',
    findFamilyButton: 'Buscar familia',
    chatButton: 'Abrir chat',
    authNotLoggedIn: 'No has iniciado sesión',
    authKidParent: 'Niño/padre',
    authGrandparent: 'Abuelo/a',
    profileLink: 'Perfil',
    familyPreviewLabel: 'Tu familia',
    startLabel: 'Empezar',
    signedOutTitle: 'Aquí viven las historias de tu familia.',
    signedOutText:
      'Primero inicia sesión, conecta con cuentas reales de tu familia y empieza un chat privado.',
    signedOutButton: 'Iniciar sesión',
    familyReadyTitle: 'Personas con las que puedes chatear ahora.',
    familyEmptyTitle: 'Crea tu circulo familiar.',
    incomingRequestSingle: '1 solicitud en espera',
    incomingRequestMany: (count) => `${count} solicitudes en espera`,
    incomingRequestText:
      'Alguien quiere conectar contigo. Revisa la solicitud y acéptala para empezar a chatear.',
    reviewButton: 'Revisar',
    waitingTitle: 'Esperando a la familia',
    waitingText: 'Tu solicitud fue enviada. Cuando la acepten, su perfil aparecerá aquí.',
    checkStatusButton: 'Ver estado',
    addFamilyTitle: 'Agrega tu primer familiar',
    addFamilyText:
      'Busca por correo, envía una solicitud y esta tarjeta se convertirá en tu centro familiar.',
    openFamilyChatTitle: 'Abre el chat familiar',
    openFamilyChatText:
      'Envía mensajes, notas de voz, videos y preguntas con las personas conectadas arriba.',
    findFamilyTitle: 'Solicitudes familiares',
    findFamilyIntro:
      'Busca a alguien por email o nombre de usuario, envía una solicitud y conecta cuando acepte.',
    yourRoleTitle: 'Tu rol',
    editProfileLink: 'Editar perfil',
    grandmaSearchPlaceholder: 'Email o usuario de la abuela',
    familySearchPlaceholder: 'Email o usuario de la familia',
    findButton: 'Buscar',
    peopleFoundTitle: 'Personas encontradas',
    searchHint: 'Busca el email o nombre de usuario que usaron al registrarse.',
    requestsToAcceptTitle: 'Solicitudes por aceptar',
    loadingRequests: 'Cargando solicitudes...',
    requestsToAcceptEmpty: 'Cuando alguien pida conectar, puedes aceptar o rechazar aquí.',
    sentRequestsTitle: 'Solicitudes enviadas',
    loadingSentRequests: 'Cargando solicitudes enviadas...',
    sentRequestsEmpty: 'Las solicitudes enviadas estarán aquí hasta que la otra persona responda.',
    acceptButton: 'Aceptar',
    declineButton: 'Rechazar',
    waitingChip: 'Esperando',
    cancelButton: 'Cancelar',
    yourFamilyTitle: 'Tu familia',
    acceptedRequestsEmpty: 'Las solicitudes aceptadas aparecerán aquí.',
    familyChatButton: 'Chat',
    askQuestionsButton: 'Hacer preguntas',
    sendingRequest: 'Enviando...',
    sendRequestButton: 'Enviar solicitud',
    connectedLabel: 'Conectado',
    waitingForYouLabel: 'Esperando por ti',
    declinedLabel: 'Rechazada',
    requestSentLabel: 'Solicitud enviada',
    noAccountFound: 'No se encontró una cuenta. Revisa el email o usuario e intenta de nuevo.',
    couldNotLoadRequests: 'No se pudieron cargar las solicitudes familiares.',
    couldNotSearchFamily: 'No se pudo buscar familia.',
    familyRequestAccepted: 'Solicitud familiar aceptada.',
    familyRequestSent: 'Solicitud familiar enviada.',
    requestSentDetails:
      'Solicitud enviada. Aparecerá en Solicitudes enviadas hasta que la acepten.',
    couldNotSendRequest: 'No se pudo enviar la solicitud.',
    familyRequestDeclined: 'Solicitud familiar rechazada.',
    couldNotUpdateRequest: 'No se pudo actualizar la solicitud.',
    requestCanceled: 'Solicitud cancelada.',
    couldNotCancelRequest: 'No se pudo cancelar la solicitud.',
  },
  ru: {
    languageName: 'Русский',
    heroTitle: 'Сохраните семейные истории, пока они не исчезли.',
    heroText:
      'Войдите, один раз настройте профиль, подключите семью и храните вопросы и ответы в одном приватном чате.',
    loginButton: 'Войти или создать аккаунт',
    findFamilyButton: 'Найти семью',
    chatButton: 'Открыть чат',
    authNotLoggedIn: 'Вы не вошли',
    authKidParent: 'Ребенок/родитель',
    authGrandparent: 'Бабушка/дедушка',
    profileLink: 'Профиль',
    familyPreviewLabel: 'Ваша семья',
    startLabel: 'Начать',
    signedOutTitle: 'Здесь будут жить истории вашей семьи.',
    signedOutText:
      'Сначала войдите, затем подключите реальные аккаунты семьи и начните приватный чат.',
    signedOutButton: 'Войти',
    familyReadyTitle: 'Люди, с которыми вы уже можете общаться.',
    familyEmptyTitle: 'Создайте свой семейный круг.',
    incomingRequestSingle: '1 запрос ожидает',
    incomingRequestMany: (count) => `${count} запроса ожидают`,
    incomingRequestText:
      'Кто-то хочет подключиться к вам. Проверьте запрос и примите его, чтобы начать чат.',
    reviewButton: 'Проверить',
    waitingTitle: 'Ждем семью',
    waitingText: 'Ваш запрос отправлен. Когда его примут, профиль появится здесь.',
    checkStatusButton: 'Проверить статус',
    addFamilyTitle: 'Добавьте первого члена семьи',
    addFamilyText:
      'Найдите человека по email, отправьте запрос, и эта карточка станет вашим семейным центром.',
    openFamilyChatTitle: 'Открыть семейный чат',
    openFamilyChatText:
      'Отправляйте сообщения, голосовые заметки, видео и вопросы людям, подключенным выше.',
    findFamilyTitle: 'Семейные запросы',
    findFamilyIntro:
      'Найдите человека по email или имени пользователя, отправьте запрос и подключитесь после принятия.',
    yourRoleTitle: 'Ваша роль',
    editProfileLink: 'Редактировать профиль',
    grandmaSearchPlaceholder: 'Email или имя пользователя бабушки',
    familySearchPlaceholder: 'Email или имя пользователя семьи',
    findButton: 'Найти',
    peopleFoundTitle: 'Найденные люди',
    searchHint: 'Введите email или имя пользователя, которые они использовали при регистрации.',
    requestsToAcceptTitle: 'Запросы на принятие',
    loadingRequests: 'Загрузка запросов...',
    requestsToAcceptEmpty: 'Когда кто-то попросит подключиться, вы сможете принять или отклонить запрос здесь.',
    sentRequestsTitle: 'Отправленные запросы',
    loadingSentRequests: 'Загрузка отправленных запросов...',
    sentRequestsEmpty: 'Отправленные запросы будут здесь, пока другой человек не ответит.',
    acceptButton: 'Принять',
    declineButton: 'Отклонить',
    waitingChip: 'Ожидание',
    cancelButton: 'Отменить',
    yourFamilyTitle: 'Ваша семья',
    acceptedRequestsEmpty: 'Принятые запросы появятся здесь.',
    familyChatButton: 'Чат',
    askQuestionsButton: 'Задать вопросы',
    sendingRequest: 'Отправка...',
    sendRequestButton: 'Отправить запрос',
    connectedLabel: 'Подключено',
    waitingForYouLabel: 'Ждет вас',
    declinedLabel: 'Отклонено',
    requestSentLabel: 'Запрос отправлен',
    noAccountFound: 'Аккаунт не найден. Проверьте email или имя пользователя и попробуйте снова.',
    couldNotLoadRequests: 'Не удалось загрузить семейные запросы.',
    couldNotSearchFamily: 'Не удалось найти семью.',
    familyRequestAccepted: 'Семейный запрос принят.',
    familyRequestSent: 'Семейный запрос отправлен.',
    requestSentDetails: 'Запрос отправлен. Он будет в отправленных запросах, пока его не примут.',
    couldNotSendRequest: 'Не удалось отправить запрос.',
    familyRequestDeclined: 'Семейный запрос отклонен.',
    couldNotUpdateRequest: 'Не удалось обновить запрос.',
    requestCanceled: 'Запрос отменен.',
    couldNotCancelRequest: 'Не удалось отменить запрос.',
  },
  fr: {
    languageName: 'Français',
    heroTitle: "Gardez les histoires de votre famille avant qu'elles ne disparaissent.",
    heroText:
      'Connectez-vous, configurez votre profil une seule fois, ajoutez votre famille et gardez les questions et réponses dans un chat privé.',
    loginButton: 'Se connecter ou créer un compte',
    findFamilyButton: 'Trouver la famille',
    chatButton: 'Ouvrir le chat',
    authNotLoggedIn: 'Non connecté',
    authKidParent: 'Enfant/parent',
    authGrandparent: 'Grand-parent',
    profileLink: 'Profil',
    familyPreviewLabel: 'Votre famille',
    startLabel: 'Commencer',
    signedOutTitle: 'Les histoires de votre famille vivent ici.',
    signedOutText:
      "Connectez-vous d'abord, ajoutez de vrais comptes familiaux et commencez un chat privé.",
    signedOutButton: 'Se connecter',
    familyReadyTitle: 'Les personnes avec qui vous pouvez discuter maintenant.',
    familyEmptyTitle: 'Créez votre cercle familial.',
    incomingRequestSingle: '1 demande en attente',
    incomingRequestMany: (count) => `${count} demandes en attente`,
    incomingRequestText:
      "Quelqu'un veut se connecter avec vous. Examinez la demande et acceptez-la pour commencer à discuter.",
    reviewButton: 'Examiner',
    waitingTitle: 'En attente de la famille',
    waitingText: 'Votre demande a été envoyée. Quand elle sera acceptée, le profil apparaîtra ici.',
    checkStatusButton: 'Voir le statut',
    addFamilyTitle: 'Ajoutez votre premier membre de famille',
    addFamilyText:
      'Recherchez par e-mail, envoyez une demande, et cette carte deviendra votre espace familial.',
    openFamilyChatTitle: 'Ouvrir le chat familial',
    openFamilyChatText:
      'Envoyez des messages, des notes vocales, des vidéos et des questions aux personnes connectées ci-dessus.',
    findFamilyTitle: 'Demandes familiales',
    findFamilyIntro:
      "Trouvez quelqu'un par e-mail ou nom d'utilisateur, envoyez une demande et connectez-vous après acceptation.",
    yourRoleTitle: 'Votre rôle',
    editProfileLink: 'Modifier le profil',
    grandmaSearchPlaceholder: "E-mail ou nom d'utilisateur de grand-mère",
    familySearchPlaceholder: "E-mail ou nom d'utilisateur de la famille",
    findButton: 'Trouver',
    peopleFoundTitle: 'Personnes trouvées',
    searchHint: "Recherchez l'e-mail ou le nom d'utilisateur utilisé lors de l'inscription.",
    requestsToAcceptTitle: 'Demandes à accepter',
    loadingRequests: 'Chargement des demandes...',
    requestsToAcceptEmpty:
      'Quand quelqu’un demande à se connecter, vous pouvez accepter ou refuser ici.',
    sentRequestsTitle: 'Demandes envoyées',
    loadingSentRequests: 'Chargement des demandes envoyées...',
    sentRequestsEmpty:
      "Les demandes envoyées resteront ici jusqu'à ce que l'autre personne réponde.",
    acceptButton: 'Accepter',
    declineButton: 'Refuser',
    waitingChip: 'En attente',
    cancelButton: 'Annuler',
    yourFamilyTitle: 'Votre famille',
    acceptedRequestsEmpty: 'Les demandes acceptées apparaîtront ici.',
    familyChatButton: 'Chat',
    askQuestionsButton: 'Poser des questions',
    sendingRequest: 'Envoi...',
    sendRequestButton: 'Envoyer une demande',
    connectedLabel: 'Connecté',
    waitingForYouLabel: 'En attente de vous',
    declinedLabel: 'Refusée',
    requestSentLabel: 'Demande envoyée',
    noAccountFound:
      "Aucun compte trouvé. Vérifiez l'e-mail ou le nom d'utilisateur et réessayez.",
    couldNotLoadRequests: 'Impossible de charger les demandes familiales.',
    couldNotSearchFamily: 'Impossible de rechercher la famille.',
    familyRequestAccepted: 'Demande familiale acceptée.',
    familyRequestSent: 'Demande familiale envoyée.',
    requestSentDetails:
      "Demande envoyée. Elle apparaîtra dans les demandes envoyées jusqu'à acceptation.",
    couldNotSendRequest: 'Impossible d’envoyer la demande.',
    familyRequestDeclined: 'Demande familiale refusée.',
    couldNotUpdateRequest: 'Impossible de mettre à jour la demande.',
    requestCanceled: 'Demande annulée.',
    couldNotCancelRequest: 'Impossible d’annuler la demande.',
  },
};
