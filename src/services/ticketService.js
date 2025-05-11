<<<<<<< HEAD
=======
// src/services/ticketService.js (с реальным API)
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
import api from './api';

const ticketService = {
  /**
   * Получение всех заявок
   * @param {Object} options - Опции запроса
   * @returns {Promise<Array>}
   */
<<<<<<< HEAD
  getAllTickets: async (options = {}) => {
    try {
      console.log('ticketService.getAllTickets called with options:', options);
      const response = await api.get('/tickets', options);
      console.log('ticketService.getAllTickets response:', response);
      return response;
    } catch (error) {
      console.error('ticketService.getAllTickets error:', error);
      throw error;
    }
=======
  getAllTickets: async () => {
    return await api.get('/tickets');
  },

  /**
   * Получение заявок пользователя
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  getUserTickets: async (userId) => {
    return await api.get(`/users/${userId}/tickets`);
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
  },

  /**
   * Получение заявки по ID
   * @param {number|string} id
   * @param {Object} options - Опции запроса
   * @returns {Promise<Object>}
   */
<<<<<<< HEAD
  getTicketById: async (id, options = {}) => {
    try {
      console.log('ticketService.getTicketById called with:', { id, options });

      // Проверяем наличие ID
      if (!id) {
        throw new Error('ID заявки не указан');
      }

      // Нормализуем ID - убираем лишние символы
      const normalizedId = String(id).trim();
      console.log('ticketService.getTicketById normalized ID:', normalizedId);

      // Делаем запрос
      const response = await api.get(`/tickets/${normalizedId}`, options);
      console.log('ticketService.getTicketById raw response:', response);

      // Проверяем, что получили данные
      if (!response) {
        console.warn('ticketService.getTicketById: пустой ответ от API');
        return null;
      }

      console.log('ticketService.getTicketById result:', response);
      return response;
    } catch (error) {
      console.error('ticketService.getTicketById error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        config: error.config
      });
      throw error;
    }
=======
  getTicketById: async (id) => {
    return await api.get(`/tickets/${id}`);
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
  },

  /**
   * Создание новой заявки
   * @param {Object} ticketData
   * @returns {Promise<Object>}
   */
  createTicket: async (ticketData) => {
<<<<<<< HEAD
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
      console.error('ticketService.createTicket error:', error);
      throw error;
    }
=======
    // Создаем объект FormData для отправки файлов
    const formData = new FormData();

    // Добавляем все поля заявки
    Object.keys(ticketData).forEach(key => {
      if (key !== 'attachments') {
        formData.append(key, ticketData[key]);
      }
    });

    // Добавляем файлы, если они есть
    if (ticketData.attachments && ticketData.attachments.length > 0) {
      ticketData.attachments.forEach(file => {
        formData.append('files', file);
      });
    }

    return await api.post('/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
  },

  /**
   * Обновление заявки
<<<<<<< HEAD
   * @param {string|number} id
=======
   * @param {string} id
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
   * @param {Object} ticketData
   * @returns {Promise<Object>}
   */
  updateTicket: async (id, ticketData) => {
<<<<<<< HEAD
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
      console.error('ticketService.updateTicket error:', error);
      throw error;
    }
=======
    // Создаем объект FormData для отправки файлов
    const formData = new FormData();

    // Добавляем все поля заявки
    Object.keys(ticketData).forEach(key => {
      if (key !== 'attachments') {
        formData.append(key, ticketData[key]);
      }
    });

    // Добавляем файлы, если они есть
    if (ticketData.attachments && ticketData.attachments.length > 0) {
      ticketData.attachments.forEach(file => {
        formData.append('files', file);
      });
    }

    return await api.put(`/tickets/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
  },

  /**
   * Удаление заявки
<<<<<<< HEAD
   * @param {string|number} id
   * @returns {Promise<void>}
   */
  deleteTicket: async (id) => {
    try {
      const response = await api.delete(`/tickets/${id}`);
      return response;
    } catch (error) {
      console.error('ticketService.deleteTicket error:', error);
      throw error;
    }
=======
   * @param {string} id
   * @returns {Promise<void>}
   */
  deleteTicket: async (id) => {
    return await api.delete(`/tickets/${id}`);
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
  },

  /**
   * Добавление комментария к заявке
<<<<<<< HEAD
   * @param {string|number} ticketId
=======
   * @param {string} ticketId
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
   * @param {string} text
   * @returns {Promise<Object>}
   */
  addComment: async (ticketId, text) => {
<<<<<<< HEAD
    try {
      const response = await api.post(`/tickets/${ticketId}/comments`, { text });
      return response;
    } catch (error) {
      console.error('ticketService.addComment error:', error);
      throw error;
    }
=======
    return await api.post(`/tickets/${ticketId}/comments`, { text });
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
  },

  /**
   * Изменение статуса заявки
<<<<<<< HEAD
   * @param {string|number} ticketId
=======
   * @param {string} ticketId
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
   * @param {string} status
   * @param {string} comment
   * @returns {Promise<Object>}
   */
  changeStatus: async (ticketId, status, comment = '') => {
<<<<<<< HEAD
    try {
      console.log('ticketService.changeStatus called with:', { ticketId, status, comment });

      const payload = { status };
      if (comment) {
        payload.comment = comment;
      }

      const response = await api.patch(`/tickets/${ticketId}/status`, payload);
      console.log('ticketService.changeStatus response:', response);
      return response;
    } catch (error) {
      console.error('ticketService.changeStatus error:', error);
      throw error;
    }
=======
    return await api.patch(`/tickets/${ticketId}/status`, { status, comment });
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
  },

  /**
   * Назначение исполнителя заявки
<<<<<<< HEAD
   * @param {string|number} ticketId
   * @param {string|number} userId
   * @returns {Promise<Object>}
   */
  assignTicket: async (ticketId, userId) => {
    try {
      console.log('ticketService.assignTicket called with:', { ticketId, userId });

      const response = await api.patch(`/tickets/${ticketId}/assign`, { userId });
      console.log('ticketService.assignTicket response:', response);
      return response;
    } catch (error) {
      console.error('ticketService.assignTicket error:', error);
      throw error;
    }
=======
   * @param {string} ticketId
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  assignTicket: async (ticketId, userId) => {
    return await api.patch(`/tickets/${ticketId}/assign`, { userId });
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
  },

  /**
   * Удаление вложения
<<<<<<< HEAD
   * @param {string|number} ticketId
   * @param {string|number} attachmentId
   * @returns {Promise<Object>}
   */
  deleteAttachment: async (ticketId, attachmentId) => {
    try {
      const response = await api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
      return response;
    } catch (error) {
      console.error('ticketService.deleteAttachment error:', error);
      throw error;
    }
  },

  /**
   * Скачивание вложения
   * @param {string|number} ticketId
   * @param {string|number} attachmentId
   * @returns {Promise<Blob>}
   */
  downloadAttachment: async (ticketId, attachmentId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}/attachments/${attachmentId}/download`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('ticketService.downloadAttachment error:', error);
      throw error;
    }
  },

  /**
   * Получение истории изменений заявки
   * @param {string|number} ticketId
   * @returns {Promise<Array>}
   */
  getTicketHistory: async (ticketId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}/history`);
      return response;
    } catch (error) {
      console.error('ticketService.getTicketHistory error:', error);
      throw error;
    }
  },

  /**
   * Поиск заявок
   * @param {Object} searchParams
   * @returns {Promise<Array>}
   */
  searchTickets: async (searchParams) => {
    try {
      const queryString = new URLSearchParams();

      Object.keys(searchParams).forEach(key => {
        if (searchParams[key]) {
          queryString.append(key, searchParams[key]);
        }
      });

      const response = await api.get(`/tickets/search?${queryString.toString()}`);
      return response;
    } catch (error) {
      console.error('ticketService.searchTickets error:', error);
      throw error;
    }
  },

  /**
   * Получение статистики заявок
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  getTicketStats: async (params = {}) => {
    try {
      const queryString = new URLSearchParams();

      Object.keys(params).forEach(key => {
        if (params[key]) {
          queryString.append(key, params[key]);
        }
      });

      const response = await api.get(`/tickets/stats?${queryString.toString()}`);
      return response;
    } catch (error) {
      console.error('ticketService.getTicketStats error:', error);
      throw error;
    }
  },

  /**
   * Массовое обновление заявок
   * @param {Array} ticketIds
   * @param {Object} updateData
   * @returns {Promise<Array>}
   */
  bulkUpdateTickets: async (ticketIds, updateData) => {
    try {
      const response = await api.patch('/tickets/bulk-update', {
        ticketIds,
        updateData
      });
      return response;
    } catch (error) {
      console.error('ticketService.bulkUpdateTickets error:', error);
      throw error;
    }
  },

  /**
   * Экспорт заявок
   * @param {Object} exportParams
   * @returns {Promise<Blob>}
   */
  exportTickets: async (exportParams) => {
    try {
      const queryString = new URLSearchParams();

      Object.keys(exportParams).forEach(key => {
        if (exportParams[key]) {
          queryString.append(key, exportParams[key]);
        }
      });

      const response = await api.get(`/tickets/export?${queryString.toString()}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('ticketService.exportTickets error:', error);
      throw error;
    }
=======
   * @param {string} ticketId
   * @param {string} attachmentId
   * @returns {Promise<Object>}
   */
  deleteAttachment: async (ticketId, attachmentId) => {
    return await api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
  }
};

export default ticketService;
