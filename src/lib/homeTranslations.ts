export type HomeLanguage = 'en' | 'es' | 'ru' | 'fr' | 'kk';

export type HomeTranslation = {
  languageName: string;
  heroTitle: string;
  heroText: string;
  loginButton: string;
  findFamilyButton: string;
  chatButton: string;
  textBookButton: string;
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
  backButton: string;
  privateChatLabel: string;
  onlineLabel: string;
  awayLabel: string;
  familyChatTitle: string;
  chatPhotoLabel: string;
  changeChatPhotoLabel: string;
  chatPhotoUpdated: string;
  askGrandmaPlaceholder: string;
  answerPlaceholder: string;
  sendButton: string;
  sendingLabel: string;
  micButton: string;
  cameraButton: string;
  recordVoiceTitle: string;
  recordVideoTitle: string;
  sendRecording: (type: string) => string;
  voiceRecordingStarted: string;
  videoRecordingStarted: string;
  voiceAnswerSent: string;
  videoAnswerSent: string;
  recordingBlocked: string;
  questionIdeasTitle: string;
  skipButton: string;
  openQuestionSuggestions: string;
  replyKidLabel: string;
  replyGrandmaLabel: string;
  replyingTo: (name: string) => string;
  mediaMessageLabel: string;
  followUpTitle: string;
  readingLatestStory: string;
  useButton: string;
  refreshButton: string;
  checkingLogin: string;
  loadingFamilyChat: string;
  noFamilyConnected: string;
  noFamilyConnectedHelp: string;
  logInBeforeChat: string;
  chatLoginHelp: string;
  writingLabel: string;
  exportBookButton: string;
  writingBook: string;
  bookDownloaded: string;
  questionFromHome: string;
  dateLocale: string;
  todayLabel: string;
  yesterdayLabel: string;
};

export const homeLanguages: HomeLanguage[] = ['en', 'es', 'ru', 'fr', 'kk'];

export const homeTranslations: Record<HomeLanguage, HomeTranslation> = {
  en: {
    languageName: 'English',
    heroTitle: 'Save your family stories before they disappear.',
    heroText:
      'Log in, set up your profile once, connect your family, and keep questions and answers in one private chat.',
    loginButton: 'Log in or create account',
    findFamilyButton: 'Find family',
    chatButton: 'Open chat',
    textBookButton: 'Make a book from text',
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
    backButton: 'Back',
    privateChatLabel: 'private chat',
    onlineLabel: 'online',
    awayLabel: 'away',
    familyChatTitle: 'Family chat',
    chatPhotoLabel: 'Chat photo',
    changeChatPhotoLabel: 'Change chat photo',
    chatPhotoUpdated: 'Chat photo updated for you.',
    askGrandmaPlaceholder: 'Ask grandma something...',
    answerPlaceholder: 'Write an answer or record your voice...',
    sendButton: 'Send',
    sendingLabel: 'Sending...',
    micButton: 'Mic',
    cameraButton: 'Camera',
    recordVoiceTitle: 'Record voice',
    recordVideoTitle: 'Record video',
    sendRecording: (type) => `Send ${type}`,
    voiceRecordingStarted: 'Voice recording started.',
    videoRecordingStarted: 'Video recording started.',
    voiceAnswerSent: 'Voice answer sent.',
    videoAnswerSent: 'Video answer sent.',
    recordingBlocked: 'Recording permission was blocked.',
    questionIdeasTitle: 'Question ideas',
    skipButton: 'Skip',
    openQuestionSuggestions: 'Open question suggestions',
    replyKidLabel: 'Kid',
    replyGrandmaLabel: 'Grandma',
    replyingTo: (name) => `Replying to ${name}`,
    mediaMessageLabel: 'Media message',
    followUpTitle: 'Follow-up from this chat',
    readingLatestStory: 'Reading the latest story...',
    useButton: 'Use',
    refreshButton: 'Refresh',
    checkingLogin: 'Checking your login...',
    loadingFamilyChat: 'Loading family chat...',
    noFamilyConnected: 'No family connected yet.',
    noFamilyConnectedHelp:
      'Send or accept a family request, then this becomes your real chat.',
    logInBeforeChat: 'Log in before chat.',
    chatLoginHelp: 'Use Google or email first, then connect your family.',
    writingLabel: 'Writing...',
    exportBookButton: 'Export book',
    writingBook: 'Writing your book...',
    bookDownloaded: 'Book PDF downloaded.',
    questionFromHome: 'Question from home',
    dateLocale: 'en',
    todayLabel: 'Today',
    yesterdayLabel: 'Yesterday',
  },
  es: {
    languageName: 'Español',
    heroTitle: 'Guarda las historias de tu familia antes de que desaparezcan.',
    heroText:
      'Inicia sesion, configura tu perfil una vez, conecta con tu familia y guarda preguntas y respuestas en un chat privado.',
    loginButton: 'Iniciar sesión o crear cuenta',
    findFamilyButton: 'Buscar familia',
    chatButton: 'Abrir chat',
    textBookButton: 'Crear un libro desde texto',
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
    backButton: 'Volver',
    privateChatLabel: 'chat privado',
    onlineLabel: 'en línea',
    awayLabel: 'ausente',
    familyChatTitle: 'Chat familiar',
    chatPhotoLabel: 'Foto del chat',
    changeChatPhotoLabel: 'Cambiar foto del chat',
    chatPhotoUpdated: 'Foto del chat actualizada para ti.',
    askGrandmaPlaceholder: 'Pregúntale algo a la abuela...',
    answerPlaceholder: 'Escribe una respuesta o graba tu voz...',
    sendButton: 'Enviar',
    sendingLabel: 'Enviando...',
    micButton: 'Micrófono',
    cameraButton: 'Cámara',
    recordVoiceTitle: 'Grabar voz',
    recordVideoTitle: 'Grabar video',
    sendRecording: (type) => `Enviar ${type}`,
    voiceRecordingStarted: 'Grabación de voz iniciada.',
    videoRecordingStarted: 'Grabación de video iniciada.',
    voiceAnswerSent: 'Respuesta de voz enviada.',
    videoAnswerSent: 'Respuesta de video enviada.',
    recordingBlocked: 'El permiso de grabación fue bloqueado.',
    questionIdeasTitle: 'Ideas de preguntas',
    skipButton: 'Saltar',
    openQuestionSuggestions: 'Abrir ideas de preguntas',
    replyKidLabel: 'Niño',
    replyGrandmaLabel: 'Abuela',
    replyingTo: (name) => `Respondiendo a ${name}`,
    mediaMessageLabel: 'Mensaje multimedia',
    followUpTitle: 'Seguimiento de este chat',
    readingLatestStory: 'Leyendo la historia más reciente...',
    useButton: 'Usar',
    refreshButton: 'Actualizar',
    checkingLogin: 'Revisando tu sesión...',
    loadingFamilyChat: 'Cargando chat familiar...',
    noFamilyConnected: 'Todavía no hay familia conectada.',
    noFamilyConnectedHelp:
      'Envía o acepta una solicitud familiar, y esto se convertirá en tu chat real.',
    logInBeforeChat: 'Inicia sesión antes del chat.',
    chatLoginHelp: 'Usa Google o email primero, luego conecta con tu familia.',
    writingLabel: 'Escribiendo...',
    exportBookButton: 'Exportar libro',
    writingBook: 'Escribiendo tu libro...',
    bookDownloaded: 'PDF del libro descargado.',
    questionFromHome: 'Pregunta desde inicio',
    dateLocale: 'es',
    todayLabel: 'Hoy',
    yesterdayLabel: 'Ayer',
  },
  ru: {
    languageName: 'Русский',
    heroTitle: 'Сохраните семейные истории, пока они не исчезли.',
    heroText:
      'Войдите, один раз настройте профиль, подключите семью и храните вопросы и ответы в одном приватном чате.',
    loginButton: 'Войти или создать аккаунт',
    findFamilyButton: 'Найти семью',
    chatButton: 'Открыть чат',
    textBookButton: 'Создать книгу из текста',
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
    backButton: 'Назад',
    privateChatLabel: 'приватный чат',
    onlineLabel: 'онлайн',
    awayLabel: 'не в сети',
    familyChatTitle: 'Семейный чат',
    chatPhotoLabel: 'Фото чата',
    changeChatPhotoLabel: 'Изменить фото чата',
    chatPhotoUpdated: 'Фото чата обновлено для вас.',
    askGrandmaPlaceholder: 'Спросите бабушку о чем-нибудь...',
    answerPlaceholder: 'Напишите ответ или запишите голос...',
    sendButton: 'Отправить',
    sendingLabel: 'Отправка...',
    micButton: 'Микрофон',
    cameraButton: 'Камера',
    recordVoiceTitle: 'Записать голос',
    recordVideoTitle: 'Записать видео',
    sendRecording: (type) => `Отправить ${type === 'audio' ? 'аудио' : 'видео'}`,
    voiceRecordingStarted: 'Запись голоса началась.',
    videoRecordingStarted: 'Запись видео началась.',
    voiceAnswerSent: 'Голосовой ответ отправлен.',
    videoAnswerSent: 'Видеоответ отправлен.',
    recordingBlocked: 'Разрешение на запись заблокировано.',
    questionIdeasTitle: 'Идеи вопросов',
    skipButton: 'Пропустить',
    openQuestionSuggestions: 'Открыть идеи вопросов',
    replyKidLabel: 'Ребенок',
    replyGrandmaLabel: 'Бабушка',
    replyingTo: (name) => `Ответ для ${name}`,
    mediaMessageLabel: 'Медиа-сообщение',
    followUpTitle: 'Продолжение из этого чата',
    readingLatestStory: 'Читаем последнюю историю...',
    useButton: 'Использовать',
    refreshButton: 'Обновить',
    checkingLogin: 'Проверяем вход...',
    loadingFamilyChat: 'Загрузка семейного чата...',
    noFamilyConnected: 'Семья еще не подключена.',
    noFamilyConnectedHelp:
      'Отправьте или примите семейный запрос, и здесь появится настоящий чат.',
    logInBeforeChat: 'Войдите перед чатом.',
    chatLoginHelp: 'Сначала войдите через Google или email, затем подключите семью.',
    writingLabel: 'Создаем...',
    exportBookButton: 'Экспорт книги',
    writingBook: 'Создаем вашу книгу...',
    bookDownloaded: 'PDF книги скачан.',
    questionFromHome: 'Вопрос с главной',
    dateLocale: 'ru',
    todayLabel: 'Сегодня',
    yesterdayLabel: 'Вчера',
  },
  fr: {
    languageName: 'Français',
    heroTitle: "Gardez les histoires de votre famille avant qu'elles ne disparaissent.",
    heroText:
      'Connectez-vous, configurez votre profil une seule fois, ajoutez votre famille et gardez les questions et réponses dans un chat privé.',
    loginButton: 'Se connecter ou créer un compte',
    findFamilyButton: 'Trouver la famille',
    chatButton: 'Ouvrir le chat',
    textBookButton: 'Créer un livre depuis un texte',
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
    backButton: 'Retour',
    privateChatLabel: 'chat privé',
    onlineLabel: 'en ligne',
    awayLabel: 'absent',
    familyChatTitle: 'Chat familial',
    chatPhotoLabel: 'Photo du chat',
    changeChatPhotoLabel: 'Changer la photo du chat',
    chatPhotoUpdated: 'Photo du chat mise à jour pour vous.',
    askGrandmaPlaceholder: 'Posez une question à grand-mère...',
    answerPlaceholder: 'Écrivez une réponse ou enregistrez votre voix...',
    sendButton: 'Envoyer',
    sendingLabel: 'Envoi...',
    micButton: 'Micro',
    cameraButton: 'Caméra',
    recordVoiceTitle: 'Enregistrer la voix',
    recordVideoTitle: 'Enregistrer une vidéo',
    sendRecording: (type) => `Envoyer ${type === 'audio' ? 'l’audio' : 'la vidéo'}`,
    voiceRecordingStarted: 'Enregistrement vocal commencé.',
    videoRecordingStarted: 'Enregistrement vidéo commencé.',
    voiceAnswerSent: 'Réponse vocale envoyée.',
    videoAnswerSent: 'Réponse vidéo envoyée.',
    recordingBlocked: 'L’autorisation d’enregistrement a été bloquée.',
    questionIdeasTitle: 'Idées de questions',
    skipButton: 'Ignorer',
    openQuestionSuggestions: 'Ouvrir les idées de questions',
    replyKidLabel: 'Enfant',
    replyGrandmaLabel: 'Grand-mère',
    replyingTo: (name) => `Réponse à ${name}`,
    mediaMessageLabel: 'Message média',
    followUpTitle: 'Relance depuis ce chat',
    readingLatestStory: 'Lecture de la dernière histoire...',
    useButton: 'Utiliser',
    refreshButton: 'Actualiser',
    checkingLogin: 'Vérification de la connexion...',
    loadingFamilyChat: 'Chargement du chat familial...',
    noFamilyConnected: 'Aucune famille connectée pour le moment.',
    noFamilyConnectedHelp:
      'Envoyez ou acceptez une demande familiale, puis ceci deviendra votre vrai chat.',
    logInBeforeChat: 'Connectez-vous avant le chat.',
    chatLoginHelp: 'Utilisez Google ou un e-mail d’abord, puis ajoutez votre famille.',
    writingLabel: 'Écriture...',
    exportBookButton: 'Exporter le livre',
    writingBook: 'Écriture de votre livre...',
    bookDownloaded: 'PDF du livre téléchargé.',
    questionFromHome: 'Question depuis l’accueil',
    dateLocale: 'fr',
    todayLabel: 'Aujourd’hui',
    yesterdayLabel: 'Hier',
  },
  kk: {
    languageName: 'Қазақша',
    heroTitle: 'Отбасы оқиғаларын жоғалып кетпей тұрып сақтаңыз.',
    heroText:
      'Кіріңіз, профиліңізді бір рет реттеңіз, отбасыңызды қосыңыз және сұрақтар мен жауаптарды бір жеке чатта сақтаңыз.',
    loginButton: 'Кіру немесе аккаунт ашу',
    findFamilyButton: 'Отбасын табу',
    chatButton: 'Чатты ашу',
    textBookButton: 'Мәтіннен кітап жасау',
    authNotLoggedIn: 'Кірмегенсіз',
    authKidParent: 'Бала/ата-ана',
    authGrandparent: 'Ата-әже',
    profileLink: 'Профиль',
    familyPreviewLabel: 'Сіздің отбасыңыз',
    startLabel: 'Бастау',
    signedOutTitle: 'Отбасы оқиғаларыңыз осында сақталады.',
    signedOutText:
      'Алдымен кіріңіз, содан кейін отбасы аккаунттарын қосып, жеке чат бастаңыз.',
    signedOutButton: 'Кіру',
    familyReadyTitle: 'Қазір сөйлесе алатын адамдар.',
    familyEmptyTitle: 'Отбасы шеңберіңізді құрыңыз.',
    incomingRequestSingle: '1 сұраныс күтіп тұр',
    incomingRequestMany: (count) => `${count} сұраныс күтіп тұр`,
    incomingRequestText:
      'Біреу сізбен қосылғысы келеді. Сұранысты қарап, чатты бастау үшін қабылдаңыз.',
    reviewButton: 'Қарау',
    waitingTitle: 'Отбасын күту',
    waitingText: 'Сұранысыңыз жіберілді. Олар қабылдағаннан кейін профилі осында шығады.',
    checkStatusButton: 'Күйін тексеру',
    addFamilyTitle: 'Алғашқы отбасы мүшесін қосыңыз',
    addFamilyText:
      'Email арқылы іздеп, сұраныс жіберіңіз. Бұл карта сіздің отбасы орталығыңызға айналады.',
    openFamilyChatTitle: 'Отбасы чатын ашу',
    openFamilyChatText:
      'Жоғарыда қосылған адамдарға хабарлама, дауыс жазбасы, видео және сұрақ жіберіңіз.',
    findFamilyTitle: 'Отбасы сұраныстары',
    findFamilyIntro:
      'Адамды email немесе username арқылы тауып, сұраныс жіберіңіз. Қабылдағаннан кейін қосыласыз.',
    yourRoleTitle: 'Сіздің рөліңіз',
    editProfileLink: 'Профильді өзгерту',
    grandmaSearchPlaceholder: 'Әженің email-і немесе username-і',
    familySearchPlaceholder: 'Отбасының email-і немесе username-і',
    findButton: 'Табу',
    peopleFoundTitle: 'Табылған адамдар',
    searchHint: 'Тіркелген кезде қолданған email немесе username арқылы іздеңіз.',
    requestsToAcceptTitle: 'Қабылдайтын сұраныстар',
    loadingRequests: 'Сұраныстар жүктелуде...',
    requestsToAcceptEmpty: 'Біреу қосылуды сұраса, оны осы жерден қабылдап немесе бас тарта аласыз.',
    sentRequestsTitle: 'Жіберілген сұраныстар',
    loadingSentRequests: 'Жіберілген сұраныстар жүктелуде...',
    sentRequestsEmpty: 'Жіберген сұраныстарыңыз басқа адам жауап бергенше осында тұрады.',
    acceptButton: 'Қабылдау',
    declineButton: 'Бас тарту',
    waitingChip: 'Күтілуде',
    cancelButton: 'Болдырмау',
    yourFamilyTitle: 'Сіздің отбасыңыз',
    acceptedRequestsEmpty: 'Қабылданған сұраныстар осында шығады.',
    familyChatButton: 'Чат',
    askQuestionsButton: 'Сұрақ қою',
    sendingRequest: 'Жіберілуде...',
    sendRequestButton: 'Сұраныс жіберу',
    connectedLabel: 'Қосылды',
    waitingForYouLabel: 'Сізді күтіп тұр',
    declinedLabel: 'Қабылданбады',
    requestSentLabel: 'Сұраныс жіберілді',
    noAccountFound: 'Аккаунт табылмады. Email немесе username-ді тексеріп, қайта көріңіз.',
    couldNotLoadRequests: 'Отбасы сұраныстарын жүктеу мүмкін болмады.',
    couldNotSearchFamily: 'Отбасын іздеу мүмкін болмады.',
    familyRequestAccepted: 'Отбасы сұранысы қабылданды.',
    familyRequestSent: 'Отбасы сұранысы жіберілді.',
    requestSentDetails: 'Сұраныс жіберілді. Олар қабылдағанша ол жіберілген сұраныстарда тұрады.',
    couldNotSendRequest: 'Сұранысты жіберу мүмкін болмады.',
    familyRequestDeclined: 'Отбасы сұранысы қабылданбады.',
    couldNotUpdateRequest: 'Сұранысты жаңарту мүмкін болмады.',
    requestCanceled: 'Сұраныс болдырылмады.',
    couldNotCancelRequest: 'Сұранысты болдырмау мүмкін болмады.',
    backButton: 'Артқа',
    privateChatLabel: 'жеке чат',
    onlineLabel: 'онлайн',
    awayLabel: 'жоқ',
    familyChatTitle: 'Отбасы чаты',
    chatPhotoLabel: 'Чат суреті',
    changeChatPhotoLabel: 'Чат суретін өзгерту',
    chatPhotoUpdated: 'Чат суреті сіз үшін жаңартылды.',
    askGrandmaPlaceholder: 'Әжеге бір нәрсе сұраңыз...',
    answerPlaceholder: 'Жауап жазыңыз немесе дауысыңызды жазыңыз...',
    sendButton: 'Жіберу',
    sendingLabel: 'Жіберілуде...',
    micButton: 'Микрофон',
    cameraButton: 'Камера',
    recordVoiceTitle: 'Дауыс жазу',
    recordVideoTitle: 'Видео жазу',
    sendRecording: (type) => `Жіберу: ${type === 'audio' ? 'аудио' : 'видео'}`,
    voiceRecordingStarted: 'Дауыс жазу басталды.',
    videoRecordingStarted: 'Видео жазу басталды.',
    voiceAnswerSent: 'Дауыс жауабы жіберілді.',
    videoAnswerSent: 'Видео жауабы жіберілді.',
    recordingBlocked: 'Жазуға рұқсат бұғатталды.',
    questionIdeasTitle: 'Сұрақ идеялары',
    skipButton: 'Өткізу',
    openQuestionSuggestions: 'Сұрақ идеяларын ашу',
    replyKidLabel: 'Бала',
    replyGrandmaLabel: 'Әже',
    replyingTo: (name) => `${name} хабарына жауап`,
    mediaMessageLabel: 'Медиа хабарлама',
    followUpTitle: 'Осы чаттан қосымша сұрақ',
    readingLatestStory: 'Соңғы оқиға оқылып жатыр...',
    useButton: 'Қолдану',
    refreshButton: 'Жаңарту',
    checkingLogin: 'Кіру тексерілуде...',
    loadingFamilyChat: 'Отбасы чаты жүктелуде...',
    noFamilyConnected: 'Әлі отбасы қосылмаған.',
    noFamilyConnectedHelp:
      'Отбасы сұранысын жіберіңіз немесе қабылдаңыз, содан кейін бұл нақты чат болады.',
    logInBeforeChat: 'Чат алдында кіріңіз.',
    chatLoginHelp: 'Алдымен Google немесе email арқылы кіріңіз, содан кейін отбасыңызды қосыңыз.',
    writingLabel: 'Жазылуда...',
    exportBookButton: 'Кітапты шығару',
    writingBook: 'Кітап жасалып жатыр...',
    bookDownloaded: 'Кітап жүктелді.',
    questionFromHome: 'Басты беттен сұрақ',
    dateLocale: 'kk',
    todayLabel: 'Бүгін',
    yesterdayLabel: 'Кеше',
  },
};
