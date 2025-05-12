// src/services/ticketService.js
import api from './api';

const ticketService = {
  /**
   * Получение всех заявок
   * @param {Object} options - Опции запроса
   * @returns {Promise<Array>}
   */
  getAllTickets: async (options = {}) => {
    try {
      const response = await api.get('/tickets', options);
      return response;
    } catch (error) {
      console.error('Ошибка получения заявок:', error);
      throw error;
    }
  },

  /**
   * Получение заявок пользователя
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  getUserTickets: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/tickets`);
      return response;
    } catch (error) {
      console.error('Ошибка получения заявок пользователя:', error);
      throw error;
    }
  },

  /**
 * Получение заявки по ID
 * @param {number|string} id
 * @param {Object} options - Опции запроса
 * @returns {Promise<Object>}
 */
  getTicketById: async (id, options = {}) => {
    try {
      if (!id) {
        throw new Error('ID заявки не указан');
      }

      // Нормализуем ID - убираем лишние символы и пробелы
      const normalizedId = String(id).trim().replace(/"/g, '');
      console.log('ticketService.getTicketById normalized ID:', normalizedId);

      // Добавляем ретрай для надежности
      let response = null;
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;

      while (attempts < maxAttempts) {
        try {
          // Делаем запрос
          response = await api.get(`/tickets/${normalizedId}`, options);
          break; // Если успешно, выходим из цикла
        } catch (error) {
          lastError = error;
          console.warn(`Попытка ${attempts + 1}/${maxAttempts} загрузки заявки не удалась:`, error);

          // Проверяем, стоит ли повторять запрос
          if (error.status === 404 || attempts >= maxAttempts - 1) {
            // Если 404 или последняя попытка, не повторяем
            break;
          }

          // Экспоненциальная задержка перед повтором
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
          attempts++;
        }
      }

      if (!response) {
        // Если у нас 404, генерируем специфическую ошибку
        if (lastError && lastError.status === 404) {
          throw new Error(`Заявка с ID ${normalizedId} не найдена`);
        }
        // Иначе выбрасываем последнюю ошибку или общую ошибку
        throw lastError || new Error(`Не удалось получить заявку с ID ${normalizedId}`);
      }

      // Проверяем, что получили данные
      if (!response) {
        console.warn('ticketService.getTicketById: пустой ответ от API');
        return null;
      }

      console.log('ticketService.getTicketById result:', response);
      return response;
    } catch (error) {
      console.error(`Ошибка получения заявки ${id}:`, error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        config: error.config
      });
      throw error;
    }
},

  /**
   * Создание новой заявки
   * @param {Object} ticketData
   * @returns {Promise<Object>}
   */
  createTicket: async (ticketData) => {
    try {
      // Создаем объект FormData для отправки файлов
      const formData = new FormData();

      // Добавляем все поля заявки
      Object.keys(ticketData).forEach(key => {
        if (key !== 'attachments') {
          // Для сложных объектов преобразуем в JSON строку
          if (typeof ticketData[key] === 'object' && ticketData[key] !== null) {
            formData.append(key, JSON.stringify(ticketData[key]));
          } else {
            formData.append(key, ticketData[key]);
          }
        }
      });

      // Добавляем файлы, если они есть
      if (ticketData.attachments && ticketData.attachments.length > 0) {
        Array.from(ticketData.attachments).forEach(file => {
          formData.append('files', file);
        });
      }

      const response = await api.post('/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response;
    } catch (error) {
      console.error('Ошибка создания заявки:', error);
      throw error;
    }
  },

  /**
   * Обновление заявки
   * @param {string|number} id
   * @param {Object} ticketData
   * @returns {Promise<Object>}
   */
  updateTicket: async (id, ticketData) => {
    try {
      // Создаем объект FormData для отправки файлов
      const formData = new FormData();

      // Добавляем все поля заявки
      Object.keys(ticketData).forEach(key => {
        if (key !== 'attachments') {
          // Для сложных объектов преобразуем в JSON строку
          if (typeof ticketData[key] === 'object' && ticketData[key] !== null) {
            formData.append(key, JSON.stringify(ticketData[key]));
          } else {
            formData.append(key, ticketData[key]);
          }
        }
      });

      // Добавляем файлы, если они есть
      if (ticketData.attachments && ticketData.attachments.length > 0) {
        Array.from(ticketData.attachments).forEach(file => {
          formData.append('files', file);
        });
      }

      const response = await api.put(`/tickets/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response;
    } catch (error) {
      console.error(`Ошибка обновления заявки ${id}:`, error);
      throw error;
    }
  },

  /**
   * Удаление заявки
   * @param {string|number} id
   * @returns {Promise<void>}
   */
  deleteTicket: async (id) => {
    try {
      const response = await api.delete(`/tickets/${id}`);
      return response;
    } catch (error) {
      console.error(`Ошибка удаления заявки ${id}:`, error);
      throw error;
    }
  },

  /**
   * Добавление комментария к заявке
   * @param {string|number} ticketId
   * @param {string} text
   * @returns {Promise<Object>}
   */
  addComment: async (ticketId, text) => {
    try {
      const response = await api.post(`/tickets/${ticketId}/comments`, { text });
      return response;
    } catch (error) {
      console.error(`Ошибка добавления комментария к заявке ${ticketId}:`, error);
      throw error;
    }
  },

  /**
   * Изменение статуса заявки
   * @param {string|number} ticketId
   * @param {string} status
   * @param {string} comment
   * @returns {Promise<Object>}
   */
  changeStatus: async (ticketId, status, comment = '') => {
    try {
      const payload = { status };
      if (comment) {
        payload.comment = comment;
      }

      const response = await api.patch(`/tickets/${ticketId}/status`, payload);
      return response;
    } catch (error) {
      console.error(`Ошибка изменения статуса заявки ${ticketId}:`, error);
      throw error;
    }
  },

  /**
   * Назначение исполнителя заявки
   * @param {string|number} ticketId
   * @param {string|number} userId
   * @returns {Promise<Object>}
   */
  assignTicket: async (ticketId, userId) => {
    try {
      const response = await api.patch(`/tickets/${ticketId}/assign`, { userId });
      return response;
    } catch (error) {
      console.error(`Ошибка назначения исполнителя для заявки ${ticketId}:`, error);
      throw error;
    }
  },

  /**
   * Удаление вложения
   * @param {string|number} ticketId
   * @param {string|number} attachmentId
   * @returns {Promise<Object>}
   */
  deleteAttachment: async (ticketId, attachmentId) => {
    try {
      const response = await api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
      return response;
    } catch (error) {
      console.error(`Ошибка удаления вложения ${attachmentId} из заявки ${ticketId}:`, error);
      throw error;
    }
  }
};

export default ticketService;
