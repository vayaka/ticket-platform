import api from './api'
import { format } from 'date-fns'

// Моковые данные для разработки
let mockTickets = [
  {
    id: 1,
    title: 'Поломка принтера',
    description: 'Принтер не печатает, замятие бумаги в лотке 2',
    status: 'new',
    priority: 'high',
    category: 'hardware',
    department: 'IT',
    assignedTo: null,
    createdBy: {
      id: 3,
      name: 'Пётр Петров',
    },
    createdAt: '2025-03-01T10:30:00',
    updatedAt: '2025-03-01T10:30:00',
    dueDate: '2025-03-10T18:00:00',
    comments: [
      {
        id: 1,
        text: 'Заявка принята в обработку',
        createdBy: {
          id: 2,
          name: 'Иван Иванов',
        },
        createdAt: '2025-03-01T11:15:00',
      },
    ],
    attachments: [],
  },
  {
    id: 2,
    title: 'Не работает интернет',
    description: 'Подключение отсутствует в кабинете 305, маршрутизатор постоянно перезагружается',
    status: 'new',
    priority: 'critical',
    category: 'network',
    department: 'IT',
    assignedTo: null,
    createdBy: {
      id: 3,
      name: 'Пётр Петров',
    },
    createdAt: '2025-03-05T09:15:00',
    updatedAt: '2025-03-05T09:15:00',
    dueDate: '2025-03-07T15:00:00',
    comments: [],
    attachments: [],
  },
  {
    id: 3,
    title: 'Проблемы с кондиционером',
    description: 'Кондиционер не охлаждает, странный шум при работе в кабинете директора',
    status: 'in-progress',
    priority: 'medium',
    category: 'maintenance',
    department: 'Техническое обслуживание',
    assignedTo: {
      id: 2,
      name: 'Иван Иванов',
    },
    createdBy: {
      id: 1,
      name: 'Администратор',
    },
    createdAt: '2025-03-02T14:20:00',
    updatedAt: '2025-03-03T09:10:00',
    dueDate: '2025-03-15T18:00:00',
    comments: [
      {
        id: 2,
        text: 'Выезд специалиста запланирован на 14:00 сегодня',
        createdBy: {
          id: 2,
          name: 'Иван Иванов',
        },
        createdAt: '2025-03-03T09:10:00',
      },
    ],
    attachments: [],
  },
]

const ticketService = {
  /**
   * Получение всех заявок
   * @returns {Promise<Array>}
   */
  getAllTickets: async () => {
    // В режиме разработки используем моковые данные
    if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_API_URL) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([...mockTickets])
        }, 500) // Имитация задержки сети
      })
    }

    // В продакшене используем реальный API
    try {
      return await api.get('/tickets')
    } catch (error) {
      throw new Error(error.message || 'Ошибка получения списка заявок')
    }
  },

  /**
   * Получение заявок пользователя
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  getUserTickets: async (userId) => {
    // В режиме разработки используем моковые данные
    if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_API_URL) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const userTickets = mockTickets.filter(
            ticket => ticket.createdBy.id === userId || ticket.assignedTo?.id === userId
          )
          resolve([...userTickets])
        }, 500)
      })
    }

    try {
      return await api.get(`/users/${userId}/tickets`)
    } catch (error) {
      throw new Error(error.message || 'Ошибка получения заявок пользователя')
    }
  },

  /**
   * Получение заявки по ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  getTicketById: async (id) => {
    // В режиме разработки используем моковые данные
    if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_API_URL) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const ticket = mockTickets.find(ticket => ticket.id === parseInt(id))
          if (ticket) {
            resolve({...ticket})
          } else {
            reject(new Error('Заявка не найдена'))
          }
        }, 500)
      })
    }

    try {
      return await api.get(`/tickets/${id}`)
    } catch (error) {
      throw new Error(error.message || 'Ошибка получения заявки')
    }
  },

  /**
   * Создание новой заявки
   * @param {Object} ticketData
   * @returns {Promise<Object>}
   */
  createTicket: async (ticketData) => {
    // В режиме разработки используем моковые данные
    if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_API_URL) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const user = JSON.parse(localStorage.getItem('user') || '{}')
          const now = new Date().toISOString()

          const newTicket = {
            id: mockTickets.length + 1,
            ...ticketData,
            status: 'new',
            assignedTo: null,
            createdBy: {
              id: user.id || 3,
              name: user.name || 'Пётр Петров',
            },
            createdAt: now,
            updatedAt: now,
            comments: [],
            attachments: [],
          }

          mockTickets = [newTicket, ...mockTickets]
          resolve({...newTicket})
        }, 500)
      })
    }

    try {
      return await api.post('/tickets', ticketData)
    } catch (error) {
      throw new Error(error.message || 'Ошибка создания заявки')
    }
  },

  /**
   * Обновление заявки
   * @param {number} id
   * @param {Object} ticketData
   * @returns {Promise<Object>}
   */
  updateTicket: async (id, ticketData) => {
    // В режиме разработки используем моковые данные
    if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_API_URL) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const ticketIndex = mockTickets.findIndex(ticket => ticket.id === parseInt(id))

          if (ticketIndex !== -1) {
            const updatedTicket = {
              ...mockTickets[ticketIndex],
              ...ticketData,
              updatedAt: new Date().toISOString()
            }

            mockTickets[ticketIndex] = updatedTicket
            resolve({...updatedTicket})
          } else {
            reject(new Error('Заявка не найдена'))
          }
        }, 500)
      })
    }

    try {
      return await api.put(`/tickets/${id}`, ticketData)
    } catch (error) {
      throw new Error(error.message || 'Ошибка обновления заявки')
    }
  },

  /**
   * Удаление заявки
   * @param {number} id
   * @returns {Promise<void>}
   */
  deleteTicket: async (id) => {
    // В режиме разработки используем моковые данные
    if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_API_URL) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const ticketIndex = mockTickets.findIndex(ticket => ticket.id === parseInt(id))

          if (ticketIndex !== -1) {
            mockTickets = mockTickets.filter(ticket => ticket.id !== parseInt(id))
            resolve()
          } else {
            reject(new Error('Заявка не найдена'))
          }
        }, 500)
      })
    }

    try {
      return await api.delete(`/tickets/${id}`)
    } catch (error) {
      throw new Error(error.message || 'Ошибка удаления заявки')
    }
  },

  /**
   * Добавление комментария к заявке
   * @param {number} ticketId
   * @param {string} text
   * @returns {Promise<Object>}
   */
  addComment: async (ticketId, text) => {
    // В режиме разработки используем моковые данные
    if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_API_URL) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const ticketIndex = mockTickets.findIndex(ticket => ticket.id === parseInt(ticketId))
          const user = JSON.parse(localStorage.getItem('user') || '{}')

          if (ticketIndex !== -1) {
            const newComment = {
              id: (mockTickets[ticketIndex].comments.length > 0
                ? Math.max(...mockTickets[ticketIndex].comments.map(c => c.id)) + 1
                : 1),
              text,
              createdBy: {
                id: user.id || 2,
                name: user.name || 'Иван Иванов',
              },
              createdAt: new Date().toISOString(),
            }

            mockTickets[ticketIndex].comments.push(newComment)
            mockTickets[ticketIndex].updatedAt = new Date().toISOString()

            resolve(newComment)
          } else {
            reject(new Error('Заявка не найдена'))
          }
        }, 500)
      })
    }

    try {
      return await api.post(`/tickets/${ticketId}/comments`, { text })
    } catch (error) {
      throw new Error(error.message || 'Ошибка добавления комментария')
    }
  },

  /**
   * Изменение статуса заявки
   * @param {number} ticketId
   * @param {string} status
   * @param {string} comment
   * @returns {Promise<Object>}
   */
  changeStatus: async (ticketId, status, comment = '') => {
    // В режиме разработки используем моковые данные
    if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_API_URL) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const ticketIndex = mockTickets.findIndex(ticket => ticket.id === parseInt(ticketId))
          const user = JSON.parse(localStorage.getItem('user') || '{}')

          if (ticketIndex !== -1) {
            const updatedTicket = {
              ...mockTickets[ticketIndex],
              status,
              updatedAt: new Date().toISOString()
            }

            mockTickets[ticketIndex] = updatedTicket

            // Если комментарий указан, добавляем его
            if (comment) {
              const newComment = {
                id: (mockTickets[ticketIndex].comments.length > 0
                  ? Math.max(...mockTickets[ticketIndex].comments.map(c => c.id)) + 1
                  : 1),
                text: comment,
                createdBy: {
                  id: user.id || 2,
                  name: user.name || 'Иван Иванов',
                },
                createdAt: new Date().toISOString(),
              }

              mockTickets[ticketIndex].comments.push(newComment)
            }

            resolve({...updatedTicket})
          } else {
            reject(new Error('Заявка не найдена'))
          }
        }, 500)
      })
    }

    try {
      return await api.patch(`/tickets/${ticketId}/status`, { status, comment })
    } catch (error) {
      throw new Error(error.message || 'Ошибка изменения статуса заявки')
    }
  },

  /**
   * Назначение исполнителя заявки
   * @param {number} ticketId
   * @param {number} userId
   * @param {string} userName
   * @returns {Promise<Object>}
   */
  assignTicket: async (ticketId, userId, userName) => {
    // В режиме разработки используем моковые данные
    if (process.env.NODE_ENV === 'development' || !import.meta.env.VITE_API_URL) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const ticketIndex = mockTickets.findIndex(ticket => ticket.id === parseInt(ticketId))

          if (ticketIndex !== -1) {
            const updatedTicket = {
              ...mockTickets[ticketIndex],
              assignedTo: {
                id: userId,
                name: userName,
              },
              status: mockTickets[ticketIndex].status === 'new' ? 'assigned' : mockTickets[ticketIndex].status,
              updatedAt: new Date().toISOString()
            }

            mockTickets[ticketIndex] = updatedTicket
            resolve({...updatedTicket})
          } else {
            reject(new Error('Заявка не найдена'))
          }
        }, 500)
      })
    }

    try {
      return await api.patch(`/tickets/${ticketId}/assign`, { userId })
    } catch (error) {
      throw new Error(error.message || 'Ошибка назначения исполнителя')
    }
  },
}

export default ticketService
