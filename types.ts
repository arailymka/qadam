
export enum Language {
  KK = 'kk',
  RU = 'ru',
  EN = 'en'
}

export enum UserRole {
  ADMIN = 'admin',
  PROFESSOR = 'professor',
  STUDENT = 'student',
  GUEST = 'guest'
}

export interface Subject {
  id: string;
  name: string;
  professorId: string;
}

export interface Professor {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password?: string;
  grades?: { assignmentId: string; score: number; feedback: string }[];
}

export interface Group {
  id: string;
  name: string;
  professorId: string;
  students: Student[];
}

export interface Lecture {
  id: string;
  subjectId: string;
  title: string;
  type: 'pdf' | 'link' | 'ai';
  content?: string;
  url?: string;
  createdAt: number;
}

export interface Syllabus {
  id: string;
  subjectId: string;
  courseName: string;
  description: string;
  type: 'pdf' | 'link' | 'ai';
  pdfData?: string; 
  url?: string;
  topics?: {
    week: number;
    title: string;
    description: string;
  }[];
}

export interface TestQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Test {
  id: string;
  subjectId: string;
  topic: string;
  questions: TestQuestion[];
  maxScore: number;
  assignedGroupId: string;
  createdAt: number;
  deadline?: number;
  duration?: number;
}

export interface TestResult {
  testId: string;
  studentEmail: string;
  score: number;
  total: number;
  timestamp: number;
}

export interface AssignmentTask {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  maxPoints: number;
  fileData?: string;
  fileName?: string;
  groupId: string;
  professorId: string;
  createdAt: number;
  deadline?: number;
}

export interface StudentSubmission {
  id: string;
  taskId: string;
  studentEmail: string;
  studentName: string;
  fileData: string;
  fileName: string;
  submittedAt: number;
  aiResult?: SubmissionResult;
  individualAudit?: IndividualAuditResult;
  finalGrade?: number;
  plagiarismScore?: number;
  similarStudentEmail?: string;
}

export interface IndividualAuditResult {
  adherenceScore: number;
  topicMatch: boolean;
  missingPoints: string[];
  metPoints: string[];
  detailedCritique: string;
}

export interface SubmissionResult {
  grade: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  criteriaAdherence: string;
}

export interface Translation {
  title: string;
  dashboard: string;
  syllabuses: string;
  lectures: string;
  assignments: string;
  tests: string;
  imageEditor: string;
  groups: string;
  subjects: string;
  language: string;
  gradeBtn: string;
  generateBtn: string;
  uploadSubmission: string;
  gradingProcess: string;
  result: string;
  analytics: string;
  studentName: string;
  professorName: string;
  points: string;
  aiThinking: string;
  placeholderDesc: string;
  placeholderWork: string;
  strengthsLabel: string;
  weaknessesLabel: string;
  suggestionsLabel: string;
  courseOverview: string;
  weekPlan: string;
  showAnswers: string;
  hideAnswers: string;
  createGroup: string;
  groupName: string;
  addStudent: string;
  email: string;
  studentList: string;
  noStudents: string;
  totalGroups: string;
  totalStudents: string;
  loginAsProfessor: string;
  loginAsStudent: string;
  loginAsAdmin: string;
  welcomeBack: string;
  enterEmail: string;
  passwordLabel: string;
  login: string;
  logout: string;
  myGrades: string;
  submitWork: string;
  studentPortal: string;
  profPortal: string;
  adminPortal: string;
  manageProfessors: string;
  addProfessor: string;
  profList: string;
  resetPassword: string;
  newPassword: string;
  totalProfs: string;
  uploadPdf: string;
  onlyPdfAllowed: string;
  viewPdf: string;
  activeSyllabuses: string;
  assignTest: string;
  maxPoints: string;
  pointsPerQ: string;
  publishTest: string;
  availableTests: string;
  finishTest: string;
  testScore: string;
  testPassed: string;
  testNotAssigned: string;
  deadline: string;
  duration: string;
  timeLeft: string;
  testExpired: string;
  minutes: string;
  createAssignment: string;
  assignmentTitle: string;
  selectGroup: string;
  attachFile: string;
  comments: string;
  addComment: string;
  noAssignments: string;
  gradingCriteria: string;
  selectAssignment: string;
  delete: string;
  deleteSelected: string;
  confirmDeletion: string;
  scoreAssigned: string;
  scoreReceived: string;
  uploading: string;
  viewSubmissions: string;
  noSubmissions: string;
  uploadWorkFile: string;
  submissionSent: string;
  alreadySubmitted: string;
  setFinalGrade: string;
  finalGradeSet: string;
  analyzeGroup: string;
  groupReport: string;
  commonErrors: string;
  bestStudents: string;
  detailedAnalysis: string;
  criteriaCheck: string;
  runIndividualAudit: string;
  auditTitle: string;
  topicMatchStatus: string;
  missingRequirements: string;
  requirementsMet: string;
  critique: string;
  approveGrade: string;
  gradedStatus: string;
  viewAudit: string;
  plagiarism: string;
  aiGrade: string;
  viewBtn: string;
  edit: string;
  saveChanges: string;
  cancel: string;
  deleteAssignmentConfirm: string;
  addSubject: string;
  subjectName: string;
  selectSubject: string;
  noSubjects: string;
  addLecture: string;
  lectureTitle: string;
  lectureUrl: string;
  noLectures: string;
  lectureType: string;
  generateLecture: string;
  syllabusLink: string;
  checkPlagiarism: string;
  plagiarismResult: string;
  originality: string;
  plagiarismBtn: string;
  auditBtn: string;
  aiAssistant: string;
  selectPdfDoc: string;
  discipline: string;
  format: string;
  dateAdded: string;
  actions: string;
  courseNameLabel: string;
  syllabusCourseHeader: string;
  activeAssignments: string;
  aiGeneration: string;
  manualInput: string;
  topicName: string;
  durationLabel: string;
  questionText: string;
  questionLabel: string;
  variantsLabel: string;
  totalLabel: string;
  publishedTests: string;
  scoreLabel: string;
  datePlaceholder: string;
  submittedStatus: string;
  notSubmittedStatus: string;
  similarityDetected: string;
  formattingStandard: string;
  subjectsDesc: string;
  groupsDesc: string;
  syllabusesDesc: string;
  lecturesDesc: string;
  filterBySubject: string;
  allSubjectsFilter: string;
  assignmentsDesc: string;
  filter: string;
  allSubjects: string;
  testsDesc: string;
  deptDashboard: string;
  professorsDesc: string;
  analyticsBySubject: string;
  analyticsByGroup: string;
  analyticsByStudent: string;
  selectWeek: string;
  noLimit: string;
  addQuestion: string;
  testPreview: string;
  endLabel: string;
  noTestsPublished: string;
  expired: string;
  active: string;
  hideResults: string;
  viewResults: string;
}

export const translations: Record<Language, Translation> = {
  [Language.KK]: {
    title: "QADAM",
    dashboard: "Бақылау тақтасы",
    syllabuses: "Силлабустар",
    lectures: "Дәрістер",
    assignments: "Тапсырмалар",
    tests: "Тесттер",
    imageEditor: "AI Сурет редакторы",
    groups: "Контингент",
    subjects: "Пәндер",
    language: "Тіл",
    gradeBtn: "Бағалау",
    generateBtn: "Генерациялау",
    uploadSubmission: "Жұмысты жүктеу",
    gradingProcess: "Бағалау жүріп жатыр...",
    result: "Нәтиже",
    analytics: "Аналитика",
    studentName: "Студент аты",
    professorName: "Оқытушы аты",
    points: "Баллдар",
    aiThinking: "AI ойлануда...",
    placeholderDesc: "Тапсырманың сипаттамасын немесе критерийлерін енгізіңіз...",
    placeholderWork: "Студенттің жұмысын (код немесе мәтін) осында қойыңыз...",
    strengthsLabel: "Күшті жақтары",
    weaknessesLabel: "Жақсарту қажет тұстары",
    suggestionsLabel: "Ұсыныстар",
    courseOverview: "Курсқа шолу",
    weekPlan: "15 апталық жоспар",
    showAnswers: "Жауаптарды көрсету",
    hideAnswers: "Жауаптарды жасыру",
    createGroup: "Топ құру",
    groupName: "Топ атауы",
    addStudent: "Студент қосу",
    email: "Электрондық пошта",
    studentList: "Студенттер тізімі",
    noStudents: "Бұл топта студенттер жоқ",
    totalGroups: "Жалпы топтар",
    totalStudents: "Жалпы студенттер",
    loginAsProfessor: "Оқытушы ретінде кіру",
    loginAsStudent: "Студент ретінде кіру",
    loginAsAdmin: "Әкімші ретінде кіру",
    welcomeBack: "Қош келдіңіз",
    enterEmail: "Электрондық поштаңызды енгізіңіз",
    passwordLabel: "Құпия сөз",
    login: "Кіру",
    logout: "Шығу",
    myGrades: "Менің бағаларым",
    submitWork: "Жұмысты тапсыру",
    studentPortal: "Студенттік портал",
    profPortal: "Оқытушы порталы",
    adminPortal: "Әкімші порталы",
    manageProfessors: "Оқытушыларды басқару",
    addProfessor: "Оқытушы қосу",
    profList: "Оқытушылар тізімі",
    resetPassword: "Құпия сөзді сбростау",
    newPassword: "Жаңа құпия сөз",
    totalProfs: "Жалпы оқытушылар",
    uploadPdf: "PDF жүктеу",
    onlyPdfAllowed: "Тек PDF форматына рұқсат етілген",
    viewPdf: "PDF көру",
    activeSyllabuses: "Белсенді силлабустар",
    assignTest: "Тестті тағайындау",
    maxPoints: "Максималды балл",
    pointsPerQ: "Сұраққа балл",
    publishTest: "Тестті жариялау",
    availableTests: "Қолжетімді тесттер",
    finishTest: "Тестті аяқтау",
    testScore: "Сіздің нәтижеңіз",
    testPassed: "Тест тапсырылды",
    testNotAssigned: "Сізге тесттер тағайындалмаған",
    deadline: "Дедлайн",
    duration: "Ұзақтығы",
    timeLeft: "Қалған уақыт",
    testExpired: "Тест уақыты аяқталды",
    minutes: "минут",
    createAssignment: "Тапсырма құру",
    assignmentTitle: "Тапсырма атауы",
    selectGroup: "Топты таңдаңыз",
    attachFile: "Файлды тіркеу",
    comments: "Пікірлер",
    addComment: "Пікір қосу",
    noAssignments: "Тапсырмалар жоқ",
    gradingCriteria: "Бағалау критерийлері",
    selectAssignment: "Тапсырманы таңдаңыз",
    delete: "Жою",
    deleteSelected: "Таңдалғандарды жою",
    confirmDeletion: "Жоюды растау",
    scoreAssigned: "Балл зачислял",
    scoreReceived: "Алынған балл",
    uploading: "Жүктелуде...",
    viewSubmissions: "Тапсырылған жұмыстар",
    noSubmissions: "Жұмыстар тапсырылмаған",
    uploadWorkFile: "Жұмысты жүктеу (файл)",
    submissionSent: "Жұмыс сәтті жіберілді",
    alreadySubmitted: "Сіз бұл тапсырманы тапсырдыңыз",
    setFinalGrade: "Қорытынды балл",
    finalGradeSet: "Балл қойылды",
    analyzeGroup: "Топтық AI Анализ",
    groupReport: "Топтық есеп",
    commonErrors: "Жиі кездесетін қателер",
    bestStudents: "Үздік студенттер",
    detailedAnalysis: "Толық талдау",
    criteriaCheck: "Критерийлерге сәйкестік",
    runIndividualAudit: "Жеке AI аудит",
    auditTitle: "Жұмыстың AI аудиті",
    topicMatchStatus: "Тақырыпқа сәйкестік",
    missingRequirements: "Орындалмаған талаптар",
    requirementsMet: "Орындалған талаптар",
    critique: "Егжей-тегжейлі сын",
    approveGrade: "Бағаны бекіту",
    gradedStatus: "Бағаланды",
    viewAudit: "Аудитті көру",
    plagiarism: "Плагиат",
    aiGrade: "AI бағалау",
    viewBtn: "Көру",
    edit: "Өңдеу",
    saveChanges: "Өзгерістерді сақтау",
    cancel: "Бас тарту",
    deleteAssignmentConfirm: "Бұл тапсырманы жойғыңыз келетініне сенімдісіз бе? Оған қатысты барлық студенттік жұмыстар да жойылады.",
    addSubject: "Пән қосу",
    subjectName: "Пән атауы",
    selectSubject: "Пәнді таңдаңыз",
    noSubjects: "Пәндер жоқ",
    addLecture: "Дәріс қосу",
    lectureTitle: "Дәріс тақырыбы",
    lectureUrl: "Құжат сілтемесі",
    noLectures: "Дәрістер жоқ",
    lectureType: "Түрі",
    generateLecture: "Дәрісті генерациялау",
    syllabusLink: "Силлабус сілтемесі",
    checkPlagiarism: "Антиплагиатты тексеру",
    plagiarismResult: "Тексеру нәтижесі",
    originality: "Түпнұсқалық",
    plagiarismBtn: "Плагиат",
    auditBtn: "Аудит",
    aiAssistant: "AI көмекшісі",
    selectPdfDoc: "PDF құжатын таңдаңыз",
    discipline: "Пән",
    format: "Формат",
    dateAdded: "Қосылған күні",
    actions: "Әрекеттер",
    courseNameLabel: "Курс атауы",
    syllabusCourseHeader: "Силлабус / Курс",
    activeAssignments: "Белсенді тапсырмалар",
    aiGeneration: "AI генерациясы",
    manualInput: "Қолмен енгізу",
    topicName: "Тақырып атауы",
    durationLabel: "Ұзақтығы",
    questionText: "Сұрақ мәтіні",
    questionLabel: "Сұрақ",
    variantsLabel: "Варианттар",
    totalLabel: "Барлығы",
    publishedTests: "Жарияланған тесттер",
    scoreLabel: "Балл",
    datePlaceholder: "кк.аа.жж",
    submittedStatus: "Тапсырылды",
    notSubmittedStatus: "Тапсырылмады",
    similarityDetected: "Схожесть обнаружена",
    formattingStandard: "Times New Roman 14",
    subjectsDesc: "Академиялық пәндер мен курстарды басқару",
    groupsDesc: "Академиялық топтар мен студенттер тізімін басқару (Контингент)",
    syllabusesDesc: "Академиялық оқу бағдарламалары мен курс жоспарларын басқару",
    lecturesDesc: "Оқу материалдары мен AI арқылы жасалған мазмұнға арналған академиялық репозиторий",
    filterBySubject: "Пән бойынша сүзгі:",
    allSubjectsFilter: "Барлық пәндер",
    assignmentsDesc: "Академиялық жұмыстарды басқару және тапсыру",
    filter: "Сүзгі",
    allSubjects: "Барлық пәндер",
    testsDesc: "Арнайы нұсқалары, бағалауы және дедлайндары бар тесттерді құру немесе генерациялау",
    deptDashboard: "Департаментті басқару панелі",
    professorsDesc: "Жаңа оқытушыларды тіркеу және олардың сенім грамоталарын басқару",
    analyticsBySubject: "Пәндер бойынша талдау",
    analyticsByGroup: "Топтар бойынша талдау",
    analyticsByStudent: "Студенттер бойынша талдау",
    selectWeek: "Апта таңдау",
    noLimit: "0 = шектеусіз",
    addQuestion: "Сұрақ қосу",
    testPreview: "Тестті алдын ала қарау",
    endLabel: "Аяқталуы",
    noTestsPublished: "Жарияланған тесттер жоқ",
    expired: "Мерзімі бітті",
    active: "Белсенді",
    hideResults: "Нәтижелерді жасыру",
    viewResults: "Нәтижелерді көру"
  },
  [Language.RU]: {
    title: "QADAM",
    dashboard: "Дашборд",
    syllabuses: "Силлабусы",
    lectures: "Лекции",
    assignments: "Задания",
    tests: "Тесты",
    imageEditor: "AI Редактор изображений",
    groups: "Контингент",
    subjects: "Предметы",
    language: "Язык",
    gradeBtn: "Оценить",
    generateBtn: "Сгенерировать",
    uploadSubmission: "Загрузить работу",
    gradingProcess: "Идет оценивание...",
    result: "Результат",
    analytics: "Analytics",
    studentName: "Имя студента",
    professorName: "Имя преподавателя",
    points: "Баллы",
    aiThinking: "AI думает...",
    placeholderDesc: "Введите описание задания или критерии оценивания...",
    placeholderWork: "Вставьте работу студента (код или текст) сюда...",
    strengthsLabel: "Сильные стороны",
    weaknessesLabel: "Что нужно исправить",
    suggestionsLabel: "Рекомендации",
    courseOverview: "Обзор курса",
    weekPlan: "15-недельный план",
    showAnswers: "Показать ответы",
    hideAnswers: "Скрыть ответы",
    createGroup: "Создать группу",
    groupName: "Название группы",
    addStudent: "Добавить студента",
    email: "Почта",
    studentList: "Список студентов",
    noStudents: "В этой группе нет студентов",
    totalGroups: "Всего групп",
    totalStudents: "Всего студентов",
    loginAsProfessor: "Войти как Преподаватель",
    loginAsStudent: "Войти как Студент",
    loginAsAdmin: "Войти как Админ",
    welcomeBack: "С возвращением",
    enterEmail: "Введите вашу почту",
    passwordLabel: "Пароль",
    login: "Войти",
    logout: "Выйти",
    myGrades: "Мои оценки",
    submitWork: "Сдать работу",
    studentPortal: "Студенческий портал",
    profPortal: "Портал преподавателя",
    adminPortal: "Портал администратора",
    manageProfessors: "Управление преподавателями",
    addProfessor: "Добавить преподавателя",
    profList: "Список преподавателей",
    resetPassword: "Сбросить пароль",
    newPassword: "Новый пароль",
    totalProfs: "Всего преподавателей",
    uploadPdf: "Загрузить PDF",
    onlyPdfAllowed: "Поддерживается только формат PDF",
    viewPdf: "Смотреть PDF",
    activeSyllabuses: "Активные силлабусы",
    assignTest: "Назначить тест",
    maxPoints: "Макс. балл",
    pointsPerQ: "Блов за вопрос",
    publishTest: "Опубликовать тест",
    availableTests: "Доступные тесты",
    finishTest: "Завершить тест",
    testScore: "Ваш результат",
    testPassed: "Тест выполнен",
    testNotAssigned: "Для вас пока нет тестов",
    deadline: "Дедлайн",
    duration: "Длительность",
    timeLeft: "Осталось времени",
    testExpired: "Срок выполнения теста истек",
    minutes: "минут",
    createAssignment: "Создать задание",
    assignmentTitle: "Заголовок задания",
    selectGroup: "Выберите группу",
    attachFile: "Прикрепить файл",
    comments: "Комментарии",
    addComment: "Написать комментарий",
    noAssignments: "Заданий пока нет",
    gradingCriteria: "Критерии оценивания",
    selectAssignment: "Выберите задание",
    delete: "Удалить",
    deleteSelected: "Удалить выбранные",
    confirmDeletion: "Подтвердить удаление",
    scoreAssigned: "Балл зачислен",
    scoreReceived: "Полученный балл",
    uploading: "Загрузка...",
    viewSubmissions: "Работы студентов",
    noSubmissions: "Работы еще не сданы",
    uploadWorkFile: "Загрузить готовую работу (файл)",
    submissionSent: "Работа успешно отправлена",
    alreadySubmitted: "Вы уже сдали эту работу",
    setFinalGrade: "Итоговый балл",
    finalGradeSet: "Баллы выставлены",
    analyzeGroup: "AI Анализ итогов группы",
    groupReport: "Отчет по группе",
    commonErrors: "Типичные ошибки",
    bestStudents: "Лучшие студенты",
    detailedAnalysis: "Подробный анализ",
    criteriaCheck: "Проверка на соответствие теме и критериям",
    runIndividualAudit: "Индивидуальный AI аудит",
    auditTitle: "AI Аудит работы",
    topicMatchStatus: "Соответствие теме",
    missingRequirements: "Невыполненные пункты",
    requirementsMet: "Выполненные пункты",
    critique: "Детальная критика",
    approveGrade: "Утвердить оценку",
    gradedStatus: "Оценено",
    viewAudit: "Просмотр аудита",
    plagiarism: "Плагиат",
    aiGrade: "AI Оценка",
    viewBtn: "Просмотр",
    edit: "Редактировать",
    saveChanges: "Сохранить изменения",
    cancel: "Отмена",
    deleteAssignmentConfirm: "Вы уверены, что хотите удалить это задание? Все работы студентов по нему также будут удалены.",
    addSubject: "Добавить предмет",
    subjectName: "Название предмета",
    selectSubject: "Выберите предмет",
    noSubjects: "Список предметов пуст",
    addLecture: "Добавить лекцию",
    lectureTitle: "Тема лекции",
    lectureUrl: "Ссылка на документ",
    noLectures: "Список лекций пуст",
    lectureType: "Тип",
    generateLecture: "Сгенерировать лекцию",
    syllabusLink: "Ссылка на силлабус",
    checkPlagiarism: "Проверить на антиплагиат",
    plagiarismResult: "Результат проверки",
    originality: "Оригинальность",
    plagiarismBtn: "Плагиат",
    auditBtn: "Аудит",
    aiAssistant: "AI Ассистент",
    selectPdfDoc: "Выберите PDF документ",
    discipline: "Дисциплина",
    format: "Формат",
    dateAdded: "Дата добавления",
    actions: "Действия",
    courseNameLabel: "Название курса",
    syllabusCourseHeader: "Силлабус / Курс",
    activeAssignments: "Активные задания",
    aiGeneration: "AI Генерация",
    manualInput: "Ручной ввод",
    topicName: "Название темы",
    durationLabel: "Длительность",
    questionText: "Текст вопроса",
    questionLabel: "Вопрос",
    variantsLabel: "Варианты",
    totalLabel: "Всего",
    publishedTests: "Опубликованные тесты",
    scoreLabel: "Балл",
    datePlaceholder: "дд.мм.гг",
    submittedStatus: "Сдано",
    notSubmittedStatus: "Не сдано",
    similarityDetected: "Обнаружена схожесть",
    formattingStandard: "Times New Roman 14",
    subjectsDesc: "Управление академическими дисциплинами и курсами",
    groupsDesc: "Управление академическими группами и списками студентов (Контингент)",
    syllabusesDesc: "Управление академическими учебными планами и планами курсов",
    lecturesDesc: "Академический репозиторий для учебных материалов и контента, созданного AI",
    filterBySubject: "Фильтр по Пән:",
    allSubjectsFilter: "Все пәндер",
    assignmentsDesc: "Управление и сдача академических работ",
    filter: "Фильтр",
    allSubjects: "Все предметы",
    testsDesc: "Создание или генерация тестов с настраиваемыми вариантами, оценкой и дедлайнами",
    deptDashboard: "Панель управления департаментом",
    professorsDesc: "Регистрация новых преподавателей и управление их учетными данными",
    analyticsBySubject: "Аналитика по предметам",
    analyticsByGroup: "Аналитика по группам",
    analyticsByStudent: "Аналитика по студентам",
    selectWeek: "Выбрать неделю",
    noLimit: "0 = без ограничений",
    addQuestion: "Добавить вопрос",
    testPreview: "Предпросмотр теста",
    endLabel: "Окончание",
    noTestsPublished: "Нет опубликованных тестов",
    expired: "Истек",
    active: "Активен",
    hideResults: "Скрыть результаты",
    viewResults: "Показать результаты"
  },
  [Language.EN]: {
    title: "QADAM",
    dashboard: "Dashboard",
    syllabuses: "Syllabuses",
    lectures: "Lectures",
    assignments: "Assignments",
    tests: "Tests",
    imageEditor: "AI Image Editor",
    groups: "Contingent",
    subjects: "Subjects",
    language: "Language",
    gradeBtn: "Grade",
    generateBtn: "Generate",
    uploadSubmission: "Upload Submission",
    gradingProcess: "Grading in progress...",
    result: "Result",
    analytics: "Analytics",
    studentName: "Student Name",
    professorName: "Professor Name",
    points: "Points",
    aiThinking: "AI is thinking...",
    placeholderDesc: "Enter assignment description or grading criteria...",
    placeholderWork: "Paste student submission (code or text) here...",
    strengthsLabel: "Strengths",
    weaknessesLabel: "Areas for Improvement",
    suggestionsLabel: "Suggestions",
    courseOverview: "Course Overview",
    weekPlan: "15-Week Plan",
    showAnswers: "Show Answers",
    hideAnswers: "Hide Answers",
    createGroup: "Create Group",
    groupName: "Group Name",
    addStudent: "Add Student",
    email: "Email",
    studentList: "Student List",
    noStudents: "No students in this group",
    totalGroups: "Total Groups",
    totalStudents: "Total Students",
    loginAsProfessor: "Login as Professor",
    loginAsStudent: "Login as Student",
    loginAsAdmin: "Login as Admin",
    welcomeBack: "Welcome Back",
    enterEmail: "Enter your email",
    passwordLabel: "Password",
    login: "Login",
    logout: "Logout",
    myGrades: "My Grades",
    submitWork: "Submit Work",
    studentPortal: "Student Portal",
    profPortal: "Professor Portal",
    adminPortal: "Admin Portal",
    manageProfessors: "Manage Professors",
    addProfessor: "Add Professor",
    profList: "Professor List",
    resetPassword: "Reset Password",
    newPassword: "New Password",
    totalProfs: "Total Professors",
    uploadPdf: "Upload PDF",
    onlyPdfAllowed: "Only PDF format is allowed",
    viewPdf: "View PDF",
    activeSyllabuses: "Active Syllabuses",
    assignTest: "Assign Test",
    maxPoints: "Max Score",
    pointsPerQ: "Points per Question",
    publishTest: "Publish Test",
    availableTests: "Available Tests",
    finishTest: "Finish Test",
    testScore: "Your Score",
    testPassed: "Test Completed",
    testNotAssigned: "No tests assigned to you yet",
    deadline: "Deadline",
    duration: "Duration",
    timeLeft: "Time Left",
    testExpired: "Test deadline passed",
    minutes: "min",
    createAssignment: "Create Assignment",
    assignmentTitle: "Assignment Title",
    selectGroup: "Select Group",
    attachFile: "Attach File",
    comments: "Comments",
    addComment: "Add comment",
    noAssignments: "No assignments yet",
    gradingCriteria: "Grading Criteria",
    selectAssignment: "Select Assignment",
    delete: "Delete",
    deleteSelected: "Delete selected",
    confirmDeletion: "Confirm deletion",
    scoreAssigned: "Score assigned",
    scoreReceived: "Score Received",
    uploading: "Uploading...",
    viewSubmissions: "Student Submissions",
    noSubmissions: "No submissions yet",
    uploadWorkFile: "Upload Work (File)",
    submissionSent: "Work submitted successfully",
    alreadySubmitted: "You have already submitted this work",
    setFinalGrade: "Final Grade",
    finalGradeSet: "Grade assigned",
    analyzeGroup: "AI Group Analysis",
    groupReport: "Group Report",
    commonErrors: "Common Errors",
    bestStudents: "Top Students",
    detailedAnalysis: "Detailed Analysis",
    criteriaCheck: "Topic & Criteria Adherence",
    runIndividualAudit: "Individual AI Audit",
    auditTitle: "Individual AI Audit",
    topicMatchStatus: "Topic Correspondence",
    missingRequirements: "Missed Points",
    requirementsMet: "Requirements Met",
    critique: "Detailed Critique",
    approveGrade: "Approve Grade",
    gradedStatus: "Graded",
    viewAudit: "View Audit",
    plagiarism: "Plagiarism",
    aiGrade: "AI Grade",
    viewBtn: "View",
    edit: "Edit",
    saveChanges: "Save changes",
    cancel: "Cancel",
    deleteAssignmentConfirm: "Are you sure you want to delete this assignment? All student submissions for it will also be deleted.",
    addSubject: "Add Subject",
    subjectName: "Subject Name",
    selectSubject: "Select Subject",
    noSubjects: "No subjects found",
    addLecture: "Add Lecture",
    lectureTitle: "Lecture Title",
    lectureUrl: "Document Link",
    noLectures: "No lectures found",
    lectureType: "Type",
    generateLecture: "Generate Lecture",
    syllabusLink: "Syllabus Link",
    checkPlagiarism: "Check Plagiarism",
    plagiarismResult: "Check Result",
    originality: "Originality",
    plagiarismBtn: "Plagiarism",
    auditBtn: "Audit",
    aiAssistant: "AI Assistant",
    selectPdfDoc: "Select PDF Document",
    discipline: "Discipline",
    format: "Format",
    dateAdded: "Date Added",
    actions: "Actions",
    courseNameLabel: "Course Name",
    syllabusCourseHeader: "Syllabus / Course",
    activeAssignments: "Active Assignments",
    aiGeneration: "AI Generation",
    manualInput: "Manual Input",
    topicName: "Topic Name",
    durationLabel: "Duration",
    questionText: "Question Text",
    questionLabel: "Question",
    variantsLabel: "Variants",
    totalLabel: "Total",
    publishedTests: "Published Tests",
    scoreLabel: "Score",
    datePlaceholder: "dd.mm.yy",
    submittedStatus: "Submitted",
    notSubmittedStatus: "Not Submitted",
    similarityDetected: "Similarity detected",
    formattingStandard: "Times New Roman 14",
    subjectsDesc: "Management of academic disciplines and courses",
    groupsDesc: "Management of academic groups and student lists (Contingent)",
    syllabusesDesc: "Management of academic curriculum and course plans",
    lecturesDesc: "Academic repository for study materials and AI-generated content",
    filterBySubject: "Filter by Subject:",
    allSubjectsFilter: "All subjects",
    assignmentsDesc: "Manage and submit academic work",
    filter: "Filter",
    allSubjects: "All subjects",
    testsDesc: "Create or generate tests with custom variants, scoring, and deadlines",
    deptDashboard: "Department Management Dashboard",
    professorsDesc: "Register new faculty members and manage their credentials",
    analyticsBySubject: "Analytics by Subject",
    analyticsByGroup: "Analytics by Group",
    analyticsByStudent: "Analytics by Student",
    selectWeek: "Select Week",
    noLimit: "0 = no limit",
    addQuestion: "Add Question",
    testPreview: "Test Preview",
    endLabel: "End",
    noTestsPublished: "No tests published yet",
    expired: "Expired",
    active: "Active",
    hideResults: "Hide Results",
    viewResults: "View Results"
  }
};
