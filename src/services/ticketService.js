// src/services/ticketService.js (с реальным API)
import api from './api';

const ticketService = {
  /**
   * Получение всех заявок
   * @returns {Promise<Array>}
   */
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
  },

  /**
   * Получение заявки по ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  getTicketById: async (id) => {
    return await api.get(`/tickets/${id}`);
  },

  /**
   * Создание новой заявки
   * @param {Object} ticketData
   * @returns {Promise<Object>}
   */
  createTicket: async (ticketData) => {
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
  },

  /**
   * Обновление заявки
   * @param {string} id
   * @param {Object} ticketData
   * @returns {Promise<Object>}
   */
  updateTicket: async (id, ticketData) => {
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
  },

  /**
   * Удаление заявки
   * @param {string} id
   * @returns {Promise<void>}
   */
  deleteTicket: async (id) => {
    return await api.delete(`/tickets/${id}`);
  },

  /**
   * Добавление комментария к заявке
   * @param {string} ticketId
   * @param {string} text
   * @returns {Promise<Object>}
   */
  addComment: async (ticketId, text) => {
    return await api.post(`/tickets/${ticketId}/comments`, { text });
  },

  /**
   * Изменение статуса заявки
   * @param {string} ticketId
   * @param {string} status
   * @param {string} comment
   * @returns {Promise<Object>}
   */
  changeStatus: async (ticketId, status, comment = '') => {
    return await api.patch(`/tickets/${ticketId}/status`, { status, comment });
  },

  /**
   * Назначение исполнителя заявки
   * @param {string} ticketId
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  assignTicket: async (ticketId, userId) => {
    return await api.patch(`/tickets/${ticketId}/assign`, { userId });
  },

  /**
   * Удаление вложения
   * @param {string} ticketId
   * @param {string} attachmentId
   * @returns {Promise<Object>}
   */
  deleteAttachment: async (ticketId, attachmentId) => {
    return await api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
  }
};

export default ticketService;
