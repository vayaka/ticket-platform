import axios from 'axios'

// Создаем экземпляр axios с предустановленными настройками
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Добавляем таймаут для запросов
})

// Перехватчик для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user')

    // Добавьте лог для отладки
    console.log('Токен из localStorage:', user ? JSON.parse(user).token : 'не найден')

    if (user) {
      try {
        const userData = JSON.parse(user)
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`

          // Проверьте заголовок Authorization
          console.log('Заголовок Authorization:', config.headers.Authorization)
        }
      } catch (error) {
        console.error('Ошибка при чтении данных пользователя:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Перехватчик для обработки ошибок ответа
api.interceptors.response.use(
  (response) => {
    // Возвращаем непосредственно данные ответа
    return response.data
  },
  (error) => {
    // Обрабатываем случай, когда запрос не прошел
    if (!error.response) {
      console.error('Сетевая ошибка, сервер недоступен')
      return Promise.reject(new Error('Сервер недоступен, проверьте подключение'))
    }

    // Если ошибка 401 (неавторизован), выход из системы
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user')
      // Используем мягкий редирект вместо жесткого перенаправления
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login'
      }
    }

    // Формируем сообщение об ошибке для пользователя
    const errorMessage =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'Произошла неизвестная ошибка'

    return Promise.reject(new Error(errorMessage))
  }
)

export default api
