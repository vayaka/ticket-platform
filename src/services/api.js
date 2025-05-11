import axios from 'axios'

// Создаем экземпляр axios с предустановленными настройками
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
<<<<<<< HEAD
  timeout: 30000,
  withCredentials: false,
=======
  timeout: 10000, // Добавляем таймаут для запросов
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
})

// Кеш для GET-запросов
const requestCache = new Map()
const CACHE_DURATION = 30000 // 30 секунд

// Map для отслеживания активных запросов
const activeRequests = new Map()

// Перехватчик для добавления токена к запросам
api.interceptors.request.use(
<<<<<<< HEAD
  async (config) => {
    // Проверяем наличие URL - ИСПРАВЛЕНО
    if (!config.url && !config.baseURL) {
      console.error('URL отсутствует в config:', config)
      return Promise.reject(new Error('URL запроса не определен'))
=======
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
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
    }

    // Создаем полный URL
    const fullUrl = config.url ?
      (config.url.startsWith('http') ? config.url : `${config.baseURL || ''}${config.url}`) :
      config.baseURL

    // Создаем уникальный ключ для запроса
    const requestKey = `${config.method}-${fullUrl}-${JSON.stringify(config.params || {})}`

    // Для GET-запросов проверяем кеш
    if (config.method.toLowerCase() === 'get') {
      const cached = requestCache.get(requestKey)
      if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        console.log('Возврат из кеша:', requestKey)
        return Promise.reject({
          cached: true,
          data: cached.data,
          config: config
        })
      }
    }

    // Отменяем предыдущий запрос с тем же ключом
    if (activeRequests.has(requestKey)) {
      const existingRequest = activeRequests.get(requestKey)
      existingRequest.abort()
      activeRequests.delete(requestKey)
    }

    // Создаем новый AbortController для этого запроса
    const abortController = new AbortController()
    config.signal = abortController.signal
    activeRequests.set(requestKey, abortController)

    console.log('Отправка запроса:', config.method, config.url)

    // Добавляем токен авторизации
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`
          console.log('Установлен токен для запроса')
        }
      } catch (error) {
        console.error('Ошибка при чтении данных пользователя:', error)
      }
    }

    // Прогресс для загрузки файлов
    if (config.method.toLowerCase() === 'post' || config.method.toLowerCase() === 'put') {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log(`Загрузка ${config.url}: ${percentCompleted}%`)

        if (config.onProgress) {
          config.onProgress(percentCompleted)
        }
      }
    }

    return config
  },
  (error) => {
    console.error('Ошибка в запросе:', error)
    return Promise.reject(error)
  }
)

// Перехватчик для обработки ответов
api.interceptors.response.use(
  (response) => {
<<<<<<< HEAD
    console.log('api.interceptors.response.use: response received');
    console.log('response:', response);
    console.log('response.data:', response.data);
    console.log('response.status:', response.status);
    console.log('response.config.url:', response.config.url);

    const requestKey = `${response.config.method}-${response.config.url || response.config.baseURL}-${JSON.stringify(response.config.params || {})}`

    // Удаляем из активных запросов
    activeRequests.delete(requestKey)

    // Кешируем GET-запросы
    if (response.config.method.toLowerCase() === 'get') {
      requestCache.set(requestKey, {
        data: response.data,
        timestamp: Date.now()
      })

      // Очищаем старые записи из кеша
      if (requestCache.size > 100) {
        const firstKey = requestCache.keys().next().value
        requestCache.delete(firstKey)
      }
    }

    console.log('Получен ответ:', response.status, response.config.url)
    console.log('Данные ответа:', response.data)
    console.log('Возвращаем данные:', response.data)

    // Возвращаем только данные ответа
    return response.data
  },
  async (error) => {
    const config = error.config

    // Проверяем наличие config
    if (!config) {
      console.error('Config отсутствует в ошибке:', error)
      return Promise.reject(error)
    }

    // Обрабатываем кешированные ответы
    if (error.cached) {
      console.log('Возврат кешированных данных')
      return Promise.resolve(error.data)
    }

    // Обрабатываем отменённые запросы
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      console.log('Запрос был отменён')
      return Promise.reject(new Error('Запрос отменён'))
    }

    // Проверяем наличие сетевого подключения
    if (!navigator.onLine) {
      console.error('Отсутствует сетевое подключение')
      return Promise.reject(new Error('Отсутствует сетевое подключение'))
    }

    // Обрабатываем сетевые ошибки с retry
    if (!error.response) {
      // Проверяем, что у нас есть URL для повторной попытки
      if (!config._retry) {
        config._retry = 0
      }

      // Проверяем лимит попыток
      if (config._retry >= 3) {
        console.error('Сетевая ошибка, сервер недоступен после 3 попыток:', error)
        return Promise.reject(new Error('Сервер недоступен. Пожалуйста, проверьте подключение к сети.'))
      }

      config._retry++
      console.log(`Попытка ${config._retry}/3 повторной отправки запроса...`)

      // Ждем перед повторной попыткой (экспоненциальная задержка)
      const delay = Math.pow(2, config._retry) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))

      // ИСПРАВЛЕНО: клонируем config для повторной попытки
      const retryConfig = {
        ...config,
        url: config.url || config.baseURL,
        baseURL: config.baseURL || api.defaults.baseURL,
        _retry: config._retry
      }

      return api.request(retryConfig)
    }

    // Логируем подробности ошибки
    console.error('Ошибка API:', {
      status: error.response.status,
      data: error.response.data,
      url: config?.url,
      method: config?.method
    })

    // Обрабатываем различные статусы ошибок
    switch (error.response.status) {
      case 401:
        // Неавторизован - чистим токен и перенаправляем на логин
        localStorage.removeItem('user')

        // Показываем уведомление о необходимости повторной авторизации
        if (window.location.pathname !== '/auth/login') {
          // Сохраняем текущий путь для возврата после авторизации
          localStorage.setItem('redirectAfterLogin', window.location.pathname)
          window.location.href = '/auth/login'
        }
        break

      case 403:
        // Запрещено - обычно из-за отсутствия прав
        console.error('Недостаточно прав для выполнения операции')
        break

      case 404:
        // Не найдено
        console.error('Ресурс не найден')
        break

      case 429:
        // Слишком много запросов
        console.error('Превышен лимит запросов. Попробуйте позже.')
        break

      case 500:
      case 502:
      case 503:
      case 504:
        // Серверные ошибки
        console.error('Ошибка сервера. Попробуйте позже.')
        break
    }

    // Формируем сообщение об ошибке для пользователя
    let errorMessage = 'Произошла неизвестная ошибка'
=======
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
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    } else if (error.message) {
      errorMessage = error.message
    }

    // Создаем объект ошибки с дополнительной информацией
    const apiError = new Error(errorMessage)
    apiError.status = error.response?.status
    apiError.data = error.response?.data
    apiError.config = config

    return Promise.reject(apiError)
  }
)

// Функция для отмены всех активных запросов
api.cancelAllRequests = () => {
  activeRequests.forEach((controller) => {
    controller.abort()
  })
  activeRequests.clear()
  console.log('Все активные запросы отменены')
}

// Функция для очистки кеша
api.clearCache = () => {
  requestCache.clear()
  console.log('Кеш очищен')
}

// Функция для получения статистики кеша
api.getCacheStats = () => {
  return {
    size: requestCache.size,
    entries: Array.from(requestCache.keys()),
    activeRequests: activeRequests.size
  }
}

// Функция для настройки базового URL
api.setBaseURL = (url) => {
  api.defaults.baseURL = url
}

// Функция для включения/отключения credentials
api.setCredentials = (enabled) => {
  api.defaults.withCredentials = enabled
}

// Добавляем метод для загрузки файлов с прогрессом
api.uploadFile = async (url, file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)

  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onProgress: onProgress,
    timeout: 0 // Без таймаута для загрузки больших файлов
  })
}

// Добавляем метод для скачивания файлов
api.downloadFile = async (url, filename = null) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob'
    })

    // Создаем URL для blob'а
    const fileURL = window.URL.createObjectURL(new Blob([response]))

    // Создаем временную ссылку для скачивания
    const link = document.createElement('a')
    link.href = fileURL

    // Определяем имя файла
    if (filename) {
      link.setAttribute('download', filename)
    } else {
      // Пытаемся извлечь имя файла из заголовков
      const contentDisposition = response.headers?.['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
        if (filenameMatch) {
          link.setAttribute('download', filenameMatch[1])
        }
      }
    }

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Освобождаем память
    window.URL.revokeObjectURL(fileURL)

    return true
  } catch (error) {
    console.error('Ошибка при скачивании файла:', error)
    throw error
  }
}

export default api
