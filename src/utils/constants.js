/**
 * Константы для статусов заявок
 */
export const TICKET_STATUSES = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
}

/**
 * Константы для приоритетов заявок
 */
export const TICKET_PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

/**
 * Константы для категорий заявок
 */
export const TICKET_CATEGORIES = {
  HARDWARE: 'hardware',
  SOFTWARE: 'software',
  NETWORK: 'network',
  MAINTENANCE: 'maintenance',
  OTHER: 'other',
}

/**
 * Константы для ролей пользователей
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
}

/**
 * Константы для отделов
 */
export const DEPARTMENTS = {
  IT: 'IT',
  HR: 'HR',
  MAINTENANCE: 'maintenance',
  OTHER: 'other',
}

/**
 * Локализованные названия статусов
 */
export const TICKET_STATUS_NAMES = {
  [TICKET_STATUSES.NEW]: 'Новая',
  [TICKET_STATUSES.ASSIGNED]: 'Назначена',
  [TICKET_STATUSES.IN_PROGRESS]: 'В работе',
  [TICKET_STATUSES.COMPLETED]: 'Выполнена',
}

/**
 * Локализованные названия приоритетов
 */
export const TICKET_PRIORITY_NAMES = {
  [TICKET_PRIORITIES.CRITICAL]: 'Критический',
  [TICKET_PRIORITIES.HIGH]: 'Высокий',
  [TICKET_PRIORITIES.MEDIUM]: 'Средний',
  [TICKET_PRIORITIES.LOW]: 'Низкий',
}

/**
 * Локализованные названия категорий
 */
export const TICKET_CATEGORY_NAMES = {
  [TICKET_CATEGORIES.HARDWARE]: 'Оборудование',
  [TICKET_CATEGORIES.SOFTWARE]: 'Программное обеспечение',
  [TICKET_CATEGORIES.NETWORK]: 'Сеть',
  [TICKET_CATEGORIES.MAINTENANCE]: 'Техническое обслуживание',
  [TICKET_CATEGORIES.OTHER]: 'Другое',
}

/**
 * Локализованные названия отделов
 */
export const DEPARTMENT_NAMES = {
  [DEPARTMENTS.IT]: 'IT',
  [DEPARTMENTS.HR]: 'Отдел кадров',
  [DEPARTMENTS.MAINTENANCE]: 'Техническое обслуживание',
  [DEPARTMENTS.OTHER]: 'Другое',
}

/**
 * Варианты цветов для статусов заявок в Bootstrap
 */
export const TICKET_STATUS_VARIANTS = {
  [TICKET_STATUSES.NEW]: 'primary',
  [TICKET_STATUSES.ASSIGNED]: 'info',
  [TICKET_STATUSES.IN_PROGRESS]: 'warning',
  [TICKET_STATUSES.COMPLETED]: 'success',
}

/**
 * Варианты цветов для приоритетов заявок в Bootstrap
 */
export const TICKET_PRIORITY_VARIANTS = {
  [TICKET_PRIORITIES.CRITICAL]: 'danger',
  [TICKET_PRIORITIES.HIGH]: 'warning',
  [TICKET_PRIORITIES.MEDIUM]: 'info',
  [TICKET_PRIORITIES.LOW]: 'success',
}
