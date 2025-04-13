import api from './api'

// Для разработки используем моковые данные
const mockUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Администратор',
    role: 'admin',
    department: 'IT',
    token: 'mock-jwt-token-admin',
  },
  {
    id: 2,
    email: 'moderator@example.com',
    password: 'moderator123',
    name: 'Иван Иванов',
    role: 'moderator',
    department: 'IT',
    token: 'mock-jwt-token-moderator',
  },
  {
    id: 3,
    email: 'user@example.com',
    password: 'user123',
    name: 'Пётр Петров',
    role: 'user',
    department: 'Бухгалтерия',
    token: 'mock-jwt-token-user',
  },
]

const authService = {
  /**
   * Авторизация пользователя
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} Данные пользователя с токеном
   */
  login: async (email, password) => {
    // В режиме разработки используем моковые данные
    if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_API_URL) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = mockUsers.find(
            (user) => user.email === email && user.password === password
          )

          if (user) {
            // Не возвращаем пароль в клиентский код
            const { password, ...userWithoutPassword } = user
            resolve(userWithoutPassword)
          } else {
            reject(new Error('Неверный email или пароль'))
          }
        }, 500) // Имитация задержки сети
      })
    }

    // В продакшене используем реальный API
    try {
      return await api.post('/auth/login', { email, password })
    } catch (error) {
      throw new Error(error.message || 'Ошибка авторизации')
    }
  },

  /**
   * Выход из системы
   * @returns {Promise<void>}
   */
  logout: async () => {
    // В режиме разработки просто возвращаем успех
    if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_API_URL) {
      return Promise.resolve()
    }

    // В продакшене делаем запрос для инвалидации токена
    try {
      return await api.post('/auth/logout')
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error)
      // Даже при ошибке API все равно очищаем локальное хранилище
      return Promise.resolve()
    }
  },

  /**
   * Регистрация нового пользователя (для администраторов)
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  register: async (userData) => {
    try {
      return await api.post('/auth/register', userData)
    } catch (error) {
      throw new Error(error.message || 'Ошибка регистрации')
    }
  },

  /**
   * Проверка текущей сессии
   * @returns {Promise<Object>}
   */
  checkSession: async () => {
    try {
      return await api.get('/auth/me')
    } catch (error) {
      throw new Error(error.message || 'Ошибка проверки сессии')
    }
  },
}

export default authService
