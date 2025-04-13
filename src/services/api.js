import axios from 'axios'

// Создаем экземпляр axios с предустановленными настройками
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Перехватчик для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Перехватчик для обработки ошибок ответа
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error

    // Если ошибка 401 (неавторизован), выход из системы
    if (response && response.status === 401) {
      localStorage.removeItem('user')
      window.location.href = '/auth/login'
    }

    // Формируем сообщение об ошибке для пользователя
    const errorMessage =
      (response && response.data && response.data.message) ||
      error.message ||
      'Произошла неизвестная ошибка'

    return Promise.reject(new Error(errorMessage))
  }
)

export default api
