import { format, formatDistanceToNow, parseISO, formatDistance } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  TICKET_STATUS_NAMES,
  TICKET_PRIORITY_NAMES,
  TICKET_CATEGORY_NAMES,
  DEPARTMENT_NAMES,
  TICKET_STATUS_VARIANTS,
  TICKET_PRIORITY_VARIANTS,
  TIME_INTERVALS
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
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: ru })
  } catch (error) {
    console.error('Ошибка при форматировании даты:', error)
    return String(date)
  }
}

/**
 * Форматирует дату относительно текущего времени
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} Относительная дата
 */
export const formatRelativeDate = (date) => {
  if (!date) return '—'
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(dateObj, { locale: ru, addSuffix: true })
  } catch (error) {
    console.error('Ошибка при форматировании относительной даты:', error)
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
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

/**
 * Преобразует строку в формат camelCase
 * @param {string} str - Исходная строка
 * @returns {string} Строка в формате camelCase
 */
export const toCamelCase = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
}

/**
 * Преобразует строку в формат kebab-case
 * @param {string} str - Исходная строка
 * @returns {string} Строка в формате kebab-case
 */
export const toKebabCase = (str) => {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('-')
}

/**
 * Проверяет, истек ли срок заявки
 * @param {string|Date} dueDate - Дата дедлайна
 * @returns {boolean} true, если срок истек, иначе false
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) return false
  const now = new Date()
  const dueDateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
  return dueDateObj < now
}

/**
 * Вычисляет оставшееся время до дедлайна
 * @param {string|Date} dueDate - Дата дедлайна
 * @returns {Object} Объект с информацией о времени
 */
export const getTimeRemaining = (dueDate) => {
  if (!dueDate) return null

  const now = new Date()
  const dueDateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
  const diffTime = dueDateObj.getTime() - now.getTime()

  if (diffTime < 0) {
    return {
      isOverdue: true,
      timeString: 'Просрочено',
      days: Math.abs(Math.ceil(diffTime / TIME_INTERVALS.DAY)),
      hours: Math.abs(Math.ceil(diffTime / TIME_INTERVALS.HOUR)),
      minutes: Math.abs(Math.ceil(diffTime / TIME_INTERVALS.MINUTE))
    }
  }

  const days = Math.floor(diffTime / TIME_INTERVALS.DAY)
  const hours = Math.floor((diffTime % TIME_INTERVALS.DAY) / TIME_INTERVALS.HOUR)
  const minutes = Math.floor((diffTime % TIME_INTERVALS.HOUR) / TIME_INTERVALS.MINUTE)

  let timeString = ''
  if (days > 0) {
    timeString = `${days} дн.`
    if (hours > 0) timeString += ` ${hours} ч.`
  } else if (hours > 0) {
    timeString = `${hours} ч.`
    if (minutes > 0) timeString += ` ${minutes} мин.`
  } else {
    timeString = `${minutes} мин.`
  }

  return {
    isOverdue: false,
    timeString,
    days,
    hours,
    minutes
  }
}

/**
 * Форматирует размер файла в читаемый вид
 * @param {number} bytes - Размер в байтах
 * @param {number} decimals - Количество знаков после запятой
 * @returns {string} Отформатированный размер с единицей измерения
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Б'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ', 'ЭБ', 'ЗБ', 'ЙБ']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
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
    .filter(part => part.length > 0)
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

/**
 * Группирует массив объектов по указанному полю
 * @param {Array} array - Исходный массив
 * @param {string} key - Поле для группировки
 * @returns {Object} Сгруппированные данные
 */
export const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    const groupKey = currentValue[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(currentValue)
    return result
  }, {})
}

/**
 * Удаляет дубликаты из массива по указанному полю
 * @param {Array} array - Исходный массив
 * @param {string} key - Поле для проверки уникальности
 * @returns {Array} Массив без дубликатов
 */
export const uniqueBy = (array, key) => {
  const seen = new Set()
  return array.filter(item => {
    const val = item[key]
    if (seen.has(val)) {
      return false
    }
    seen.add(val)
    return true
  })
}

/**
 * Сортирует массив объектов по указанному полю
 * @param {Array} array - Исходный массив
 * @param {string} key - Поле для сортировки
 * @param {string} order - Порядок сортировки ('asc' | 'desc')
 * @returns {Array} Отсортированный массив
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    let aVal = a[key]
    let bVal = b[key]

    // Обработка вложенных свойств
    if (key.includes('.')) {
      const keys = key.split('.')
      aVal = keys.reduce((obj, k) => obj?.[k], a)
      bVal = keys.reduce((obj, k) => obj?.[k], b)
    }

    if (aVal === bVal) return 0
    if (aVal == null) return order === 'asc' ? 1 : -1
    if (bVal == null) return order === 'asc' ? -1 : 1

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc' ?
        aVal.localeCompare(bVal, 'ru') :
        bVal.localeCompare(aVal, 'ru')
    }

    return order === 'asc' ?
      (aVal < bVal ? -1 : 1) :
      (aVal > bVal ? -1 : 1)
  })
}

/**
 * Создает debounced версию функции
 * @param {Function} func - Функция для debounce
 * @param {number} wait - Время ожидания в миллисекундах
 * @returns {Function} Debounced функция
 */
export const debounce = (func, wait) => {
  let timeout

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Создает throttled версию функции
 * @param {Function} func - Функция для throttle
 * @param {number} limit - Интервал в миллисекундах
 * @returns {Function} Throttled функция
 */
export const throttle = (func, limit) => {
  let lastFunc
  let lastRan

  return function(...args) {
    if (!lastRan) {
      func.apply(this, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(this, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

/**
 * Генерирует уникальный ID
 * @param {string} prefix - Префикс для ID
 * @returns {string} Уникальный ID
 */
export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substr(2, 9)
  return prefix ? `${prefix}_${timestamp}_${randomPart}` : `${timestamp}_${randomPart}`
}

/**
 * Глубоко копирует объект
 * @param {any} obj - Объект для копирования
 * @returns {any} Копия объекта
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj

  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(deepClone)

  const clonedObj = {}
  Object.keys(obj).forEach(key => {
    clonedObj[key] = deepClone(obj[key])
  })

  return clonedObj
}

/**
 * Глубоко сравнивает два объекта
 * @param {any} obj1 - Первый объект
 * @param {any} obj2 - Второй объект
 * @returns {boolean} Результат сравнения
 */
export const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true

  if (typeof obj1 !== 'object' || obj1 === null ||
      typeof obj2 !== 'object' || obj2 === null) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }

  return true
}

/**
 * Создает селектор мемоизации
 * @param {Function} inputSelector - Функция-селектор
 * @param {Function} resultSelector - Функция для вычисления результата
 * @returns {Function} Мемоизированный селектор
 */
export const createSelector = (inputSelector, resultSelector) => {
  let lastArgs = null
  let lastResult = null

  return (...args) => {
    if (!lastArgs || !args.every((arg, index) => arg === lastArgs[index])) {
      lastArgs = args
      lastResult = resultSelector(inputSelector(...args))
    }
    return lastResult
  }
}

/**
 * Парсит query параметры из URL
 * @param {string} queryString - Query строка
 * @returns {Object} Объект с параметрами
 */
export const parseQueryParams = (queryString) => {
  if (!queryString) return {}

  return queryString
    .replace(/^\?/, '')
    .split('&')
    .reduce((params, param) => {
      if (!param) return params
      const [key, value] = param.split('=')
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
      return params
    }, {})
}

/**
 * Преобразует объект в query строку
 * @param {Object} params - Параметры
 * @returns {string} Query строка
 */
export const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return ''

  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')

  return queryString ? `?${queryString}` : ''
}

/**
 * Проверяет, является ли объект пустым
 * @param {any} obj - Объект для проверки
 * @returns {boolean} Результат проверки
 */
export const isEmpty = (obj) => {
  if (obj == null) return true
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * Безопасно получает вложенное свойство объекта
 * @param {Object} obj - Исходный объект
 * @param {string} path - Путь к свойству
 * @param {any} defaultValue - Значение по умолчанию
 * @returns {any} Значение свойства или defaultValue
 */
export const get = (obj, path, defaultValue = undefined) => {
  if (!obj || typeof obj !== 'object') return defaultValue

  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result == null || !(key in result)) {
      return defaultValue
    }
    result = result[key]
  }

  return result
}

/**
 * Безопасно устанавливает вложенное свойство объекта
 * @param {Object} obj - Исходный объект
 * @param {string} path - Путь к свойству
 * @param {any} value - Новое значение
 * @returns {Object} Новый объект с установленным значением
 */
export const set = (obj, path, value) => {
  const newObj = deepClone(obj)
  const keys = path.split('.')
  let current = newObj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
  return newObj
}

/**
 * Преобразует значение в булевый тип
 * @param {any} value - Значение для преобразования
 * @returns {boolean} Булевое значение
 */
export const toBoolean = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1'
  }
  if (typeof value === 'number') return value !== 0
  return Boolean(value)
}

/**
 * Форматирует процентное значение
 * @param {number} value - Значение от 0 до 1
 * @param {number} decimals - Количество знаков после запятой
 * @returns {string} Процентное значение
 */
export const formatPercent = (value, decimals = 1) => {
  if (typeof value !== 'number') return '0%'
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Форматирует числовое значение с разделителями
 * @param {number} value - Число для форматирования
 * @param {string} locale - Локаль (по умолчанию 'ru-RU')
 * @returns {string} Отформатированное число
 */
export const formatNumber = (value, locale = 'ru-RU') => {
  if (typeof value !== 'number') return '0'
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Валидирует и преобразует цветовое значение
 * @param {string} color - Цвет в любом формате
 * @returns {string} Цвет в hex формате
 */
export const normalizeColor = (color) => {
  if (!color) return '#000000'

  // Если уже hex формат
  if (color.startsWith('#')) {
    if (color.length === 4) {
      // Преобразуем #RGB в #RRGGBB
      return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
    }
    return color
  }

  // Преобразуем rgb/rgba в hex
  if (color.startsWith('rgb')) {
    const matches = color.match(/\d+/g)
    if (matches && matches.length >= 3) {
      const [r, g, b] = matches.map(Number)
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    }
  }

  return '#000000'
}

/**
 * Генерирует случайный цвет
 * @returns {string} Случайный цвет в hex формате
 */
export const getRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

/**
 * Проверяет, является ли цвет светлым
 * @param {string} color - Цвет в hex формате
 * @returns {boolean} true, если цвет светлый
 */
export const isLightColor = (color) => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // Формула для определения яркости цвета
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return brightness > 128
}
