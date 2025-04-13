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
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен для заполнения'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
  department: Yup.string()
    .required('Выберите отдел'),
})

/**
 * Схема валидации для формы комментария
 */
export const commentValidationSchema = Yup.object().shape({
  text: Yup.string()
    .min(2, 'Комментарий должен содержать минимум 2 символа')
    .required('Текст комментария обязателен'),
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
  phone: Yup.string()
    .nullable(),
  position: Yup.string()
    .nullable(),
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
 * Валидация типа файла
 * @param {string} fileType - MIME-тип файла
 * @param {Array} allowedTypes - Массив разрешенных MIME-типов
 * @returns {boolean} Результат валидации
 */
export const validateFileType = (fileType, allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']) => {
  return allowedTypes.includes(fileType)
}

/**
 * Валидация расширения файла
 * @param {string} fileName - Имя файла
 * @param {Array} allowedExtensions - Массив разрешенных расширений
 * @returns {boolean} Результат валидации
 */
export const validateFileExtension = (fileName, allowedExtensions = ['jpg', 'jpeg', 'png', 'heic', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar']) => {
  const ext = fileName.split('.').pop().toLowerCase()
  return allowedExtensions.includes(ext)
}
