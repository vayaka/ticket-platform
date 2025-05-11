// src/services/authService.js
import api from './api';

const authService = {
  /**
   * Авторизация пользователя
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} Данные пользователя с токеном
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      // Сохраняем токен и данные пользователя
      if (response.token) {
        localStorage.setItem('user', JSON.stringify(response));
      }

      return response;
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      throw error;
    }
  },

  /**
   * Выход из системы
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      // Отправляем запрос на сервер для завершения сессии
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      // Продолжаем процесс выхода даже при ошибке
    } finally {
      // Очищаем localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('csrfToken');
      localStorage.removeItem('refreshToken');

      // Очищаем кеш API
      if (api.clearCache) {
        api.clearCache();
      }

      // Отменяем все активные запросы
      if (api.cancelAllRequests) {
        api.cancelAllRequests();
      }
    }
  },

  /**
   * Регистрация нового пользователя (для администраторов)
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    }
  },

  /**
   * Проверка текущей сессии
   * @returns {Promise<Object>}
   */
  checkSession: async () => {
    try {
      const response = await api.get('/auth/me');

      // Обновляем данные пользователя в localStorage
      if (response) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...response };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return response;
    } catch (error) {
      console.error('Ошибка проверки сессии:', error);
      throw error;
    }
  },

  /**
   * Проверка статуса текущего пользователя
   * @returns {Boolean}
   */
  isAuthenticated: () => {
    const user = localStorage.getItem('user');
    if (!user) return false;

    try {
      const userData = JSON.parse(user);
      return !!userData.token;
    } catch (error) {
      console.error('Ошибка проверки аутентификации:', error);
      return false;
    }
  },

  /**
   * Получение текущего пользователя из localStorage
   * @returns {Object|null}
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Ошибка получения текущего пользователя:', error);
      return null;
    }
  }
};

export default authService;
