import api from './api';

const authService = {
  /**
   * Авторизация пользователя
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} Данные пользователя с токеном
   */
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  /**
   * Выход из системы
   * @returns {Promise<void>}
   */
  logout: async () => {
    return await api.post('/auth/logout');
  },

  /**
   * Регистрация нового пользователя (для администраторов)
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  /**
   * Проверка текущей сессии
   * @returns {Promise<Object>}
   */
  checkSession: async () => {
    return await api.get('/auth/me');
  },
};

export default authService;
