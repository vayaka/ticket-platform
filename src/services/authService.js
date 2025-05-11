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

        // Сохраняем CSRF токен если он есть
        if (response.csrfToken) {
          localStorage.setItem('csrfToken', response.csrfToken);
        }
      }

      return response;
    } catch (error) {
      // Логируем ошибку авторизации
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
      api.clearCache();

      // Отменяем все активные запросы
      api.cancelAllRequests();
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
   * Обновление токена доступа
   * @returns {Promise<Object>}
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      const response = await api.post('/auth/refresh', {
        refreshToken: refreshToken
      });

      // Обновляем токены
      if (response.token) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, token: response.token };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }

      return response;
    } catch (error) {
      console.error('Ошибка обновления токена:', error);

      // Если не удалось обновить токен, выполняем выход
      await this.logout();
      throw error;
    }
  },

  /**
   * Восстановление пароля
   * @param {string} email
   * @returns {Promise<Object>}
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      console.error('Ошибка восстановления пароля:', error);
      throw error;
    }
  },

  /**
   * Сброс пароля
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise<Object>}
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('Ошибка сброса пароля:', error);
      throw error;
    }
  },

  /**
   * Изменение пароля
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<Object>}
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('Ошибка изменения пароля:', error);
      throw error;
    }
  },

  /**
   * Двухфакторная аутентификация - генерация секрета
   * @returns {Promise<Object>}
   */
  generateTwoFactorSecret: async () => {
    try {
      const response = await api.post('/auth/2fa/generate');
      return response;
    } catch (error) {
      console.error('Ошибка генерации 2FA секрета:', error);
      throw error;
    }
  },

  /**
   * Двухфакторная аутентификация - активация
   * @param {string} token
   * @returns {Promise<Object>}
   */
  enableTwoFactor: async (token) => {
    try {
      const response = await api.post('/auth/2fa/enable', { token });
      return response;
    } catch (error) {
      console.error('Ошибка активации 2FA:', error);
      throw error;
    }
  },

  /**
   * Двухфакторная аутентификация - деактивация
   * @param {string} token
   * @returns {Promise<Object>}
   */
  disableTwoFactor: async (token) => {
    try {
      const response = await api.post('/auth/2fa/disable', { token });
      return response;
    } catch (error) {
      console.error('Ошибка деактивации 2FA:', error);
      throw error;
    }
  },

  /**
   * Получение списка активных сессий
   * @returns {Promise<Array>}
   */
  getActiveSessions: async () => {
    try {
      const response = await api.get('/auth/sessions');
      return response;
    } catch (error) {
      console.error('Ошибка получения сессий:', error);
      throw error;
    }
  },

  /**
   * Завершение всех сессий кроме текущей
   * @returns {Promise<Object>}
   */
  terminateOtherSessions: async () => {
    try {
      const response = await api.post('/auth/sessions/terminate-others');
      return response;
    } catch (error) {
      console.error('Ошибка завершения сессий:', error);
      throw error;
    }
  },

  /**
   * Завершение конкретной сессии
   * @param {string} sessionId
   * @returns {Promise<Object>}
   */
  terminateSession: async (sessionId) => {
    try {
      const response = await api.delete(`/auth/sessions/${sessionId}`);
      return response;
    } catch (error) {
      console.error('Ошибка завершения сессии:', error);
      throw error;
    }
  },

  /**
   * Получение настроек безопасности пользователя
   * @returns {Promise<Object>}
   */
  getSecuritySettings: async () => {
    try {
      const response = await api.get('/auth/security-settings');
      return response;
    } catch (error) {
      console.error('Ошибка получения настроек безопасности:', error);
      throw error;
    }
  },

  /**
   * Обновление настроек безопасности
   * @param {Object} settings
   * @returns {Promise<Object>}
   */
  updateSecuritySettings: async (settings) => {
    try {
      const response = await api.put('/auth/security-settings', settings);
      return response;
    } catch (error) {
      console.error('Ошибка обновления настроек безопасности:', error);
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
  },

  /**
   * Обновление профиля пользователя
   * @param {Object} profileData
   * @returns {Promise<Object>}
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);

      // Обновляем данные пользователя в localStorage
      if (response) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...response };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return response;
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      throw error;
    }
  }
};

export default authService;
