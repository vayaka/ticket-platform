import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  TICKET_STATUS_NAMES,
  TICKET_PRIORITY_NAMES,
  TICKET_CATEGORY_NAMES,
  DEPARTMENT_NAMES,
  TICKET_STATUS_VARIANTS,
  TICKET_PRIORITY_VARIANTS,
} from './constants'

/**
 * Форматирует дату в локализованную строку
 * @param {string|Date} date - Дата для форматирования
 * @param {string} formatStr - Формат даты (по умолчанию 'dd MMMM yyyy, HH:mm')
 * @returns {string} Отформатированная дата
 */
export const formatDate = (date, formatStr = 'dd MMMM yyyy, HH:mm') => {
  if (!date) return '—'
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, formatStr, { locale: ru })
  } catch (error) {
    console.error('Ошибка при форматировании даты:', error)
    return String(date)
  }
}

/**
 * Возвращает локализованное название статуса заявки
 * @param {string} status - Код статуса заявки
 * @returns {string} Локализованное название статуса
 */
export const getStatusName = (status) => {
  return TICKET_STATUS_NAMES[status] || status
}

/**
 * Возвращает локализованное название приоритета заявки
 * @param {string} priority - Код приоритета заявки
 * @returns {string} Локализованное название приоритета
 */
export const getPriorityName = (priority) => {
  return TICKET_PRIORITY_NAMES[priority] || priority
}

/**
 * Возвращает локализованное название категории заявки
 * @param {string} category - Код категории заявки
 * @returns {string} Локализованное название категории
 */
export const getCategoryName = (category) => {
  return TICKET_CATEGORY_NAMES[category] || category
}

/**
 * Возвращает локализованное название отдела
 * @param {string} department - Код отдела
 * @returns {string} Локализованное название отдела
 */
export const getDepartmentName = (department) => {
  return DEPARTMENT_NAMES[department] || department
}

/**
 * Возвращает вариант цвета Bootstrap для статуса заявки
 * @param {string} status - Код статуса заявки
 * @returns {string} Вариант цвета Bootstrap
 */
export const getStatusVariant = (status) => {
  return TICKET_STATUS_VARIANTS[status] || 'secondary'
}

/**
 * Возвращает вариант цвета Bootstrap для приоритета заявки
 * @param {string} priority - Код приоритета заявки
 * @returns {string} Вариант цвета Bootstrap
 */
export const getPriorityVariant = (priority) => {
  return TICKET_PRIORITY_VARIANTS[priority] || 'secondary'
}

/**
 * Сокращает текст до указанной длины с добавлением многоточия
 * @param {string} text - Исходный текст
 * @param {number} maxLength - Максимальная длина (по умолчанию 100)
 * @returns {string} Сокращенный текст
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Конвертирует первую букву строки в верхний регистр
 * @param {string} string - Исходная строка
 * @returns {string} Строка с первой буквой в верхнем регистре
 */
export const capitalizeFirstLetter = (string) => {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * Проверяет, истек ли срок заявки
 * @param {string|Date} dueDate - Дата дедлайна
 * @returns {boolean} true, если срок истек, иначе false
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) return false
  const now = new Date()
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  return dueDateObj < now
}

/**
 * Вычисляет оставшееся время до дедлайна в днях
 * @param {string|Date} dueDate - Дата дедлайна
 * @returns {number} Количество дней до дедлайна (отрицательное, если срок истек)
 */
export const getDaysRemaining = (dueDate) => {
  if (!dueDate) return null
  const now = new Date()
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const diffTime = dueDateObj.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Форматирует размер файла в читаемый вид
 * @param {number} bytes - Размер в байтах
 * @returns {string} Отформатированный размер с единицей измерения
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Байт'
  const k = 1024
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Генерирует инициалы из имени
 * @param {string} name - Полное имя
 * @returns {string} Инициалы
 */
export const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Вычисляет прогресс выполнения заявок
 * @param {Array} tickets - Массив заявок
 * @returns {number} Процент выполненных заявок
 */
export const calculateTicketsProgress = (tickets) => {
  if (!tickets || tickets.length === 0) return 0
  const completedTickets = tickets.filter(ticket => ticket.status === 'completed').length
  return Math.round((completedTickets / tickets.length) * 100)
}
