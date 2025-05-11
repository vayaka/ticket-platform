/**
 * Константы для статусов заявок
 */
export const TICKET_STATUSES = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on-hold'
}

/**
 * Константы для приоритетов заявок
 */
export const TICKET_PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
}

/**
 * Константы для категорий заявок
 */
export const TICKET_CATEGORIES = {
  HARDWARE: 'hardware',
  SOFTWARE: 'software',
  NETWORK: 'network',
  MAINTENANCE: 'maintenance',
  SECURITY: 'security',
  ACCESS_RIGHTS: 'access-rights',
  OTHER: 'other'
}

/**
 * Константы для ролей пользователей
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest'
}

/**
 * Константы для прав доступа
 */
export const PERMISSIONS = {
  // Заявки
  CREATE_TICKET: 'create_ticket',
  VIEW_TICKET: 'view_ticket',
  UPDATE_TICKET: 'update_ticket',
  DELETE_TICKET: 'delete_ticket',
  ASSIGN_TICKET: 'assign_ticket',
  CHANGE_STATUS: 'change_status',

  // Комментарии
  ADD_COMMENT: 'add_comment',
  VIEW_PRIVATE_COMMENTS: 'view_private_comments',
  DELETE_COMMENT: 'delete_comment',

  // Пользователи
  MANAGE_USERS: 'manage_users',
  VIEW_USER_DETAILS: 'view_user_details',

  // Отчеты
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',

  // Настройки
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_DEPARTMENTS: 'manage_departments'
}

/**
 * Константы для отделов
 */
export const DEPARTMENTS = {
  IT: 'IT',
  HR: 'HR',
  MAINTENANCE: 'maintenance',
  SECURITY: 'security',
  FINANCE: 'finance',
  LOGISTICS: 'logistics',
  SALES: 'sales',
  MARKETING: 'marketing',
  OTHER: 'other'
}

/**
 * Локализованные названия статусов
 */
export const TICKET_STATUS_NAMES = {
  [TICKET_STATUSES.NEW]: 'Новая',
  [TICKET_STATUSES.ASSIGNED]: 'Назначена',
  [TICKET_STATUSES.IN_PROGRESS]: 'В работе',
  [TICKET_STATUSES.COMPLETED]: 'Выполнена',
  [TICKET_STATUSES.CANCELLED]: 'Отменена',
  [TICKET_STATUSES.ON_HOLD]: 'На паузе'
}

/**
 * Локализованные названия приоритетов
 */
export const TICKET_PRIORITY_NAMES = {
  [TICKET_PRIORITIES.CRITICAL]: 'Критический',
  [TICKET_PRIORITIES.HIGH]: 'Высокий',
  [TICKET_PRIORITIES.MEDIUM]: 'Средний',
  [TICKET_PRIORITIES.LOW]: 'Низкий'
}

/**
 * Локализованные названия категорий
 */
export const TICKET_CATEGORY_NAMES = {
  [TICKET_CATEGORIES.HARDWARE]: 'Оборудование',
  [TICKET_CATEGORIES.SOFTWARE]: 'Программное обеспечение',
  [TICKET_CATEGORIES.NETWORK]: 'Сеть',
  [TICKET_CATEGORIES.MAINTENANCE]: 'Техническое обслуживание',
  [TICKET_CATEGORIES.SECURITY]: 'Безопасность',
  [TICKET_CATEGORIES.ACCESS_RIGHTS]: 'Права доступа',
  [TICKET_CATEGORIES.OTHER]: 'Другое'
}

/**
 * Локализованные названия отделов
 */
export const DEPARTMENT_NAMES = {
  [DEPARTMENTS.IT]: 'IT отдел',
  [DEPARTMENTS.HR]: 'Отдел кадров',
  [DEPARTMENTS.MAINTENANCE]: 'Техническое обслуживание',
  [DEPARTMENTS.SECURITY]: 'Служба безопасности',
  [DEPARTMENTS.FINANCE]: 'Финансовый отдел',
  [DEPARTMENTS.LOGISTICS]: 'Логистика',
  [DEPARTMENTS.SALES]: 'Отдел продаж',
  [DEPARTMENTS.MARKETING]: 'Маркетинг',
  [DEPARTMENTS.OTHER]: 'Другое'
}

/**
 * Варианты цветов для статусов заявок в Bootstrap
 */
export const TICKET_STATUS_VARIANTS = {
  [TICKET_STATUSES.NEW]: 'primary',
  [TICKET_STATUSES.ASSIGNED]: 'info',
  [TICKET_STATUSES.IN_PROGRESS]: 'warning',
  [TICKET_STATUSES.COMPLETED]: 'success',
  [TICKET_STATUSES.CANCELLED]: 'danger',
  [TICKET_STATUSES.ON_HOLD]: 'secondary'
}

/**
 * Варианты цветов для приоритетов заявок в Bootstrap
 */
export const TICKET_PRIORITY_VARIANTS = {
  [TICKET_PRIORITIES.CRITICAL]: 'danger',
  [TICKET_PRIORITIES.HIGH]: 'warning',
  [TICKET_PRIORITIES.MEDIUM]: 'info',
  [TICKET_PRIORITIES.LOW]: 'success'
}

/**
 * Константы для сортировки
 */
export const SORT_OPTIONS = {
  CREATED_DESC: 'createdAt_desc',
  CREATED_ASC: 'createdAt_asc',
  UPDATED_DESC: 'updatedAt_desc',
  UPDATED_ASC: 'updatedAt_asc',
  PRIORITY_DESC: 'priority_desc',
  PRIORITY_ASC: 'priority_asc',
  STATUS_DESC: 'status_desc',
  STATUS_ASC: 'status_asc',
  DUE_DATE_DESC: 'dueDate_desc',
  DUE_DATE_ASC: 'dueDate_asc'
}

/**
 * Локализованные названия опций сортировки
 */
export const SORT_OPTION_NAMES = {
  [SORT_OPTIONS.CREATED_DESC]: 'Сначала новые',
  [SORT_OPTIONS.CREATED_ASC]: 'Сначала старые',
  [SORT_OPTIONS.UPDATED_DESC]: 'Последние обновленные',
  [SORT_OPTIONS.UPDATED_ASC]: 'Давно обновленные',
  [SORT_OPTIONS.PRIORITY_DESC]: 'По убыванию приоритета',
  [SORT_OPTIONS.PRIORITY_ASC]: 'По возрастанию приоритета',
  [SORT_OPTIONS.STATUS_DESC]: 'По статусу (З-Я)',
  [SORT_OPTIONS.STATUS_ASC]: 'По статусу (А-Я)',
  [SORT_OPTIONS.DUE_DATE_DESC]: 'По дедлайну (поздние)',
  [SORT_OPTIONS.DUE_DATE_ASC]: 'По дедлайну (ранние)'
}

/**
 * Константы для типов уведомлений
 */
export const NOTIFICATION_TYPES = {
  NEW_TICKET: 'new_ticket',
  TICKET_ASSIGNED: 'ticket_assigned',
  TICKET_STATUS_CHANGED: 'ticket_status_changed',
  COMMENT_ADDED: 'comment_added',
  DUE_DATE_REMINDER: 'due_date_reminder',
  TICKET_OVERDUE: 'ticket_overdue',
  MENTION: 'mention'
}

/**
 * Константы для локализации дат
 */
export const DATE_FORMATS = {
  FULL_DATE: 'dd MMMM yyyy, HH:mm',
  SHORT_DATE: 'dd.MM.yyyy',
  SHORT_DATE_TIME: 'dd.MM.yyyy HH:mm',
  TIME_ONLY: 'HH:mm'
}

/**
 * Константы для пагинации
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_VISIBLE_PAGES: 5
}

/**
 * Константы для файлов
 */
export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 150 * 1024 * 1024, // 150 MB
  MAX_TOTAL_SIZE: 500 * 1024 * 1024, // 500 MB
  MAX_FILES_COUNT: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/heic'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ],
  ALLOWED_EXTENSIONS: [
    'jpg', 'jpeg', 'png', 'gif', 'heic',
    'pdf', 'doc', 'docx', 'xls', 'xlsx',
    'txt', 'csv', 'zip', 'rar', '7z'
  ]
}

/**
 * Константы для тем интерфейса
 */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}

/**
 * Константы для языков
 */
export const LANGUAGES = {
  RU: 'ru',
  EN: 'en'
}

/**
 * Константы для типов режимов отображения
 */
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  KANBAN: 'kanban'
}

/**
 * Константы для типов экспорта
 */
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json'
}

/**
 * Константы для временных интервалов
 */
export const TIME_INTERVALS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000
}

/**
 * Константы для настроек уведомлений
 */
export const NOTIFICATION_SETTINGS = {
  EMAIL: 'email',
  BROWSER: 'browser',
  DESKTOP: 'desktop'
}

/**
 * Константы для типов авторизации
 */
export const AUTH_METHODS = {
  LOCAL: 'local',
  LDAP: 'ldap',
  OAUTH: 'oauth',
  SAML: 'saml'
}

/**
 * Константы для статусов системы
 */
export const SYSTEM_STATUS = {
  OPERATIONAL: 'operational',
  MAINTENANCE: 'maintenance',
  DEGRADED: 'degraded',
  OUTAGE: 'outage'
}

/**
 * Константы для типов журналов
 */
export const LOG_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  DEBUG: 'debug',
  AUDIT: 'audit'
}

/**
 * API маршруты
 */
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    CHECK_SESSION: '/auth/me'
  },
  TICKETS: {
    BASE: '/tickets',
    BY_ID: (id) => `/tickets/${id}`,
    COMMENTS: (id) => `/tickets/${id}/comments`,
    STATUS: (id) => `/tickets/${id}/status`,
    ASSIGN: (id) => `/tickets/${id}/assign`,
    ATTACHMENTS: (id) => `/tickets/${id}/attachments`,
    HISTORY: (id) => `/tickets/${id}/history`,
    SEARCH: '/tickets/search',
    STATS: '/tickets/stats',
    EXPORT: '/tickets/export'
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    PROFILE: '/users/profile',
    SETTINGS: '/users/settings'
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: '/notifications/mark-read',
    SETTINGS: '/notifications/settings'
  },
  REPORTS: {
    BASE: '/reports',
    GENERATE: '/reports/generate',
    DOWNLOAD: '/reports/download'
  }
}

/**
 * Регулярные выражения
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  PHONE: /^[\+]?[(]?[\d\s\-\(\)]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_.-]{3,20}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  IP_V4: /^(\d{1,3}\.){3}\d{1,3}$/,
  IP_V6: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  CREDIT_CARD: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/,
  HEX_COLOR: /^#(?:[0-9a-fA-F]{3}){1,2}$/
}
