import * as Yup from 'yup'

/**
 * Схема валидации для формы создания/редактирования заявки
 */
export const ticketValidationSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, 'Название должно содержать минимум 5 символов')
    .max(100, 'Название должно содержать максимум 100 символов')
    .required('Название обязательно для заполнения'),
  description: Yup.string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(5000, 'Описание должно содержать максимум 5000 символов')
    .required('Описание обязательно для заполнения'),
  category: Yup.string()
    .required('Выберите категорию'),
  priority: Yup.string()
    .required('Выберите приоритет'),
  department: Yup.string()
    .required('Выберите отдел'),
  dueDate: Yup.date()
    .nullable()
    .min(new Date(), 'Дата дедлайна не может быть в прошлом'),
  assignedTo: Yup.string()
    .nullable(),
})

/**
 * Схема валидации для формы авторизации
 */
export const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Введите корректный email')
    .required('Email обязателен для заполнения'),
  password: Yup.string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен для заполнения'),
  rememberMe: Yup.boolean()
    .default(false),
  twoFactorCode: Yup.string()
    .when('requiresTwoFactor', {
      is: true,
      then: schema => schema.required('Введите код двухфакторной аутентификации')
    })
})

/**
 * Схема валидации для формы регистрации
 */
export const registerValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя должно содержать максимум 50 символов')
    .required('Имя обязательно для заполнения'),
  email: Yup.string()
    .email('Введите корректный email')
    .required('Email обязателен для заполнения'),
  password: Yup.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Пароль должен содержать строчные и заглавные буквы, цифры и специальные символы'
    )
    .required('Пароль обязателен для заполнения'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
  department: Yup.string()
    .required('Выберите отдел'),
  position: Yup.string()
    .max(100, 'Должность должна содержать максимум 100 символов'),
  phone: Yup.string()
    .matches(
      /^[\+]?[(]?[\d\s\-\(\)]+$/,
      'Введите корректный номер телефона'
    ),
  agreeToTerms: Yup.boolean()
    .oneOf([true], 'Вы должны принять условия использования')
    .required('Необходимо принять условия использования')
})

/**
 * Схема валидации для формы комментария
 */
export const commentValidationSchema = Yup.object().shape({
  text: Yup.string()
    .min(2, 'Комментарий должен содержать минимум 2 символа')
    .max(1000, 'Комментарий должен содержать максимум 1000 символов')
    .required('Текст комментария обязателен'),
  isPrivate: Yup.boolean()
    .default(false)
})

/**
 * Схема валидации для формы профиля пользователя
 */
export const profileValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя должно содержать максимум 50 символов')
    .required('Имя обязательно для заполнения'),
  email: Yup.string()
    .email('Введите корректный email')
    .required('Email обязателен для заполнения'),
  department: Yup.string()
    .required('Выберите отдел'),
  position: Yup.string()
    .max(100, 'Должность должна содержать максимум 100 символов'),
  phone: Yup.string()
    .matches(
      /^[\+]?[(]?[\d\s\-\(\)]+$/,
      'Введите корректный номер телефона'
    ),
  avatar: Yup.mixed()
    .test('fileSize', 'Размер файла не должен превышать 5 МБ', value =>
      !value || (value && value.size <= 5 * 1024 * 1024)
    )
    .test('fileType', 'Допустимы только изображения (jpeg, jpg, png)', value =>
      !value || (value && ['image/jpeg', 'image/jpg', 'image/png'].includes(value.type))
    )
})

/**
 * Схема валидации для формы изменения пароля
 */
export const changePasswordValidationSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Введите текущий пароль'),
  newPassword: Yup.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Пароль должен содержать строчные и заглавные буквы, цифры и специальные символы'
    )
    .required('Введите новый пароль'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Пароли должны совпадать')
    .required('Подтвердите новый пароль')
})

/**
 * Схема валидации для формы сброса пароля
 */
export const resetPasswordValidationSchema = Yup.object().shape({
  token: Yup.string()
    .required('Токен обязателен'),
  newPassword: Yup.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Пароль должен содержать строчные и заглавные буквы, цифры и специальные символы'
    )
    .required('Введите новый пароль'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Пароли должны совпадать')
    .required('Подтвердите новый пароль')
})

/**
 * Схема валидации для формы поиска
 */
export const searchValidationSchema = Yup.object().shape({
  query: Yup.string()
    .min(2, 'Поисковый запрос должен содержать минимум 2 символа')
    .max(100, 'Поисковый запрос должен содержать максимум 100 символов'),
  status: Yup.string()
    .oneOf(['', 'new', 'assigned', 'in-progress', 'completed'], 'Неверный статус'),
  priority: Yup.string()
    .oneOf(['', 'low', 'medium', 'high', 'critical'], 'Неверный приоритет'),
  department: Yup.string(),
  category: Yup.string(),
  assignedTo: Yup.string(),
  dateFrom: Yup.date()
    .nullable(),
  dateTo: Yup.date()
    .nullable()
    .min(Yup.ref('dateFrom'), 'Дата окончания должна быть после даты начала')
})

/**
 * Валидация размера файла
 * @param {number} fileSize - Размер файла в байтах
 * @param {number} maxSize - Максимальный размер файла в байтах
 * @returns {boolean} Результат валидации
 */
export const validateFileSize = (fileSize, maxSize = 150 * 1024 * 1024) => {
  return fileSize <= maxSize
}

/**
 * Валидация типа файла по MIME
 * @param {string} fileType - MIME-тип файла
 * @param {Array} allowedTypes - Массив разрешенных MIME-типов
 * @returns {boolean} Результат валидации
 */
export const validateFileType = (fileType, allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/gif',
  'image/heic',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
]) => {
  return allowedTypes.includes(fileType)
}

/**
 * Валидация расширения файла
 * @param {string} fileName - Имя файла
 * @param {Array} allowedExtensions - Массив разрешенных расширений
 * @returns {boolean} Результат валидации
 */
export const validateFileExtension = (fileName, allowedExtensions = [
  'jpg', 'jpeg', 'png', 'gif', 'heic',
  'pdf', 'doc', 'docx', 'xls', 'xlsx',
  'txt', 'csv', 'zip', 'rar', '7z'
]) => {
  const ext = fileName.split('.').pop().toLowerCase()
  return allowedExtensions.includes(ext)
}

/**
 * Валидация пароля
 * @param {string} password - Пароль
 * @returns {Object} Результат валидации
 */
export const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: []
  }

  if (password.length < 8) {
    result.isValid = false
    result.errors.push('Пароль должен содержать минимум 8 символов')
  }

  if (!/[a-z]/.test(password)) {
    result.isValid = false
    result.errors.push('Пароль должен содержать строчные буквы')
  }

  if (!/[A-Z]/.test(password)) {
    result.isValid = false
    result.errors.push('Пароль должен содержать заглавные буквы')
  }

  if (!/\d/.test(password)) {
    result.isValid = false
    result.errors.push('Пароль должен содержать цифры')
  }

  if (!/[@$!%*?&]/.test(password)) {
    result.isValid = false
    result.errors.push('Пароль должен содержать специальные символы (@$!%*?&)')
  }

  return result
}

/**
 * Валидация email
 * @param {string} email - Email адрес
 * @returns {boolean} Результат валидации
 */
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email)
}

/**
 * Валидация телефона
 * @param {string} phone - Номер телефона
 * @returns {boolean} Результат валидации
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone)
}

/**
 * Валидация URL
 * @param {string} url - URL адрес
 * @returns {boolean} Результат валидации
 */
export const validateUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Валидация даты
 * @param {string|Date} date - Дата
 * @returns {boolean} Результат валидации
 */
export const validateDate = (date) => {
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime())
}

/**
 * Валидация даты в будущем
 * @param {string|Date} date - Дата
 * @returns {boolean} Результат валидации
 */
export const validateFutureDate = (date) => {
  const parsedDate = new Date(date)
  const now = new Date()
  return validateDate(date) && parsedDate > now
}

/**
 * Валидация даты в прошлом
 * @param {string|Date} date - Дата
 * @returns {boolean} Результат валидации
 */
export const validatePastDate = (date) => {
  const parsedDate = new Date(date)
  const now = new Date()
  return validateDate(date) && parsedDate < now
}

/**
 * Валидация диапазона дат
 * @param {string|Date} startDate - Начальная дата
 * @param {string|Date} endDate - Конечная дата
 * @returns {boolean} Результат валидации
 */
export const validateDateRange = (startDate, endDate) => {
  if (!validateDate(startDate) || !validateDate(endDate)) {
    return false
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  return start <= end
}

/**
 * Валидация числа
 * @param {any} value - Значение
 * @param {number} min - Минимальное значение
 * @param {number} max - Максимальное значение
 * @returns {boolean} Результат валидации
 */
export const validateNumber = (value, min = -Infinity, max = Infinity) => {
  const num = Number(value)
  return !isNaN(num) && num >= min && num <= max
}

/**
 * Валидация IP адреса
 * @param {string} ip - IP адрес
 * @returns {boolean} Результат валидации
 */
export const validateIp = (ip) => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

/**
 * Валидация имени пользователя
 * @param {string} username - Имя пользователя
 * @returns {boolean} Результат валидации
 */
export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_.-]{3,20}$/
  return usernameRegex.test(username)
}

/**
 * Валидация кредитной карты
 * @param {string} cardNumber - Номер карты
 * @returns {boolean} Результат валидации
 */
export const validateCreditCard = (cardNumber) => {
  // Удаляем пробелы и дефисы
  const cleanNumber = cardNumber.replace(/[\s-]/g, '')

  // Проверяем, что это только цифры
  if (!/^\d+$/.test(cleanNumber)) {
    return false
  }

  // Алгоритм Луна
  let sum = 0
  let isEven = false

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Валидация SQL инъекций
 * @param {string} input - Пользовательский ввод
 * @returns {boolean} Результат валидации
 */
export const validateSqlInjection = (input) => {
  const sqlInjectionPatterns = [
    /'\s*OR\s*'1'\s*=\s*'1/i,
    /;\s*DROP\s+TABLE/i,
    /;\s*DELETE\s+FROM/i,
    /UNION\s+SELECT/i,
    /--/,
    /\/\*/
  ]

  return !sqlInjectionPatterns.some(pattern => pattern.test(input))
}

/**
 * Валидация XSS атак
 * @param {string} input - Пользовательский ввод
 * @returns {boolean} Результат валидации
 */
export const validateXss = (input) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    /javascript\s*:/gi,
    /on\w+\s*=/gi
  ]

  return !xssPatterns.some(pattern => pattern.test(input))
}

/**
 * Валидация MIME типов файлов
 * @param {File} file - Файл
 * @param {Array} allowedTypes - Разрешенные MIME типы
 * @returns {boolean} Результат валидации
 */
export const validateFileMimeType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type)
}

/**
 * Валидация расширений файлов
 * @param {File} file - Файл
 * @param {Array} allowedExtensions - Разрешенные расширения
 * @returns {boolean} Результат валидации
 */
export const validateFileExtensions = (file, allowedExtensions) => {
  const extension = file.name.split('.').pop().toLowerCase()
  return allowedExtensions.includes(extension)
}

/**
 * Комплексная валидация файла
 * @param {File} file - Файл
 * @param {Object} options - Опции валидации
 * @returns {Object} Результат валидации
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 150 * 1024 * 1024, // 150 MB
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf']
  } = options

  const result = {
    isValid: true,
    errors: []
  }

  // Проверка размера
  if (file.size > maxSize) {
    result.isValid = false
    result.errors.push(`Размер файла превышает ${maxSize / (1024 * 1024)} МБ`)
  }

  // Проверка MIME типа
  if (!validateFileMimeType(file, allowedTypes)) {
    result.isValid = false
    result.errors.push('Недопустимый тип файла')
  }

  // Проверка расширения
  if (!validateFileExtensions(file, allowedExtensions)) {
    result.isValid = false
    result.errors.push('Недопустимое расширение файла')
  }

  return result
}

/**
 * Валидация JSON
 * @param {string} jsonString - JSON строка
 * @returns {boolean} Результат валидации
 */
export const validateJson = (jsonString) => {
  try {
    JSON.parse(jsonString)
    return true
  } catch {
    return false
  }
}

/**
 * Валидация цвета (hex, rgb, rgba)
 * @param {string} color - Цвет
 * @returns {boolean} Результат валидации
 */
export const validateColor = (color) => {
  const hexRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/
  const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
  const rgbaRegex = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-1](?:\.\d+)?)\s*\)$/

  return hexRegex.test(color) || rgbRegex.test(color) || rgbaRegex.test(color)
}

/**
 * Создает валидатор для проверки уникальности
 * @param {Function} checkFunction - Функция проверки
 * @param {string} errorMessage - Сообщение об ошибке
 * @returns {Function} Валидатор
 */
export const createUniqueValidator = (checkFunction, errorMessage = 'Значение уже существует') => {
  return Yup.string().test('unique', errorMessage, async function(value) {
    if (!value) return true
    return await checkFunction(value)
  })
}

/**
 * Создает валидатор для проверки зависимых полей
 * @param {string} dependentField - Зависимое поле
 * @param {Function} validationFunction - Функция валидации
 * @returns {Function} Валидатор
 */
export const createDependentValidator = (dependentField, validationFunction) => {
  return Yup.mixed().when(dependentField, {
    is: validationFunction,
    then: schema => schema.required('Это поле обязательно')
  })
}
