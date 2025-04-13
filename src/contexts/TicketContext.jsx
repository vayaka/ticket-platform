import { createContext, useState, useEffect, useCallback } from 'react'
import ticketService from '../services/ticketService'

export const TicketContext = createContext()

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: '',
    search: '',
  })

  // Загрузка всех заявок
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ticketService.getAllTickets()
      setTickets(data)
      applyFilters(data, filters)
    } catch (err) {
      setError(err.message || 'Ошибка загрузки заявок')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Загрузка заявок при монтировании компонента
  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Применение фильтров
  const applyFilters = (ticketsArray, filterOptions) => {
    let filtered = [...ticketsArray]

    if (filterOptions.status) {
      filtered = filtered.filter(ticket => ticket.status === filterOptions.status)
    }

    if (filterOptions.priority) {
      filtered = filtered.filter(ticket => ticket.priority === filterOptions.priority)
    }

    if (filterOptions.department) {
      filtered = filtered.filter(ticket => ticket.department === filterOptions.department)
    }

    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase()
      filtered = filtered.filter(
        ticket =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower)
      )
    }

    setFilteredTickets(filtered)
  }

  // Обновление фильтров
  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    applyFilters(tickets, updatedFilters)
  }

  // Создание новой заявки
  const createTicket = async (ticketData) => {
    try {
      setLoading(true)
      setError(null)
      const newTicket = await ticketService.createTicket(ticketData)
      setTickets(prev => [newTicket, ...prev])
      applyFilters([newTicket, ...tickets], filters)
      return newTicket
    } catch (err) {
      setError(err.message || 'Ошибка создания заявки')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Получение заявки по ID
  const getTicketById = async (id) => {
    try {
      setLoading(true)
      setError(null)
      return await ticketService.getTicketById(id)
    } catch (err) {
      setError(err.message || 'Ошибка получения заявки')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Обновление заявки
  const updateTicket = async (id, ticketData) => {
    try {
      setLoading(true)
      setError(null)
      const updatedTicket = await ticketService.updateTicket(id, ticketData)
      setTickets(prev =>
        prev.map(ticket => ticket.id === id ? updatedTicket : ticket)
      )
      applyFilters(tickets.map(ticket => ticket.id === id ? updatedTicket : ticket), filters)
      return updatedTicket
    } catch (err) {
      setError(err.message || 'Ошибка обновления заявки')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Удаление заявки
  const deleteTicket = async (id) => {
    try {
      setLoading(true)
      setError(null)
      await ticketService.deleteTicket(id)
      const updatedTickets = tickets.filter(ticket => ticket.id !== id)
      setTickets(updatedTickets)
      applyFilters(updatedTickets, filters)
    } catch (err) {
      setError(err.message || 'Ошибка удаления заявки')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const assignTicket = async (ticketId, userId, userName) => {
    try {
      setLoading(true);
      setError(null);

      // Получаем текущую заявку
      const ticket = tickets.find(t => t.id === parseInt(ticketId));

      if (!ticket) {
        throw new Error('Заявка не найдена');
      }

      // Обновляем заявку с новым исполнителем
      const updatedTicket = {
        ...ticket,
        assignedTo: { id: userId, name: userName },
        status: ticket.status === 'new' ? 'assigned' : ticket.status,
        updatedAt: new Date().toISOString()
      };

      // В реальном приложении здесь был бы API-запрос
      const result = await ticketService.assignTicket(ticketId, userId, userName);

      // Обновляем состояние
      setTickets(prev => prev.map(t => t.id === parseInt(ticketId) ? updatedTicket : t));

      // Применяем фильтры
      applyFilters(tickets.map(t => t.id === parseInt(ticketId) ? updatedTicket : t), filters);

      return updatedTicket;
    } catch (err) {
      setError(err.message || 'Ошибка назначения исполнителя');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (ticketId, status, comment = '') => {
    try {
      setLoading(true);
      setError(null);

      // Получаем текущую заявку
      const ticket = tickets.find(t => t.id === parseInt(ticketId));

      if (!ticket) {
        throw new Error('Заявка не найдена');
      }

      // Обновляем заявку с новым статусом
      const updatedTicket = {
        ...ticket,
        status,
        updatedAt: new Date().toISOString()
      };

      // Если есть комментарий, добавляем его
      if (comment) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const newComment = {
          id: (ticket.comments && ticket.comments.length > 0)
            ? Math.max(...ticket.comments.map(c => c.id)) + 1
            : 1,
          text: comment,
          createdBy: {
            id: user.id || 1,
            name: user.name || 'Пользователь'
          },
          createdAt: new Date().toISOString()
        };

        updatedTicket.comments = [...(ticket.comments || []), newComment];
      }

      // В реальном приложении здесь был бы API-запрос
      const result = await ticketService.changeStatus(ticketId, status, comment);

      // Обновляем состояние
      setTickets(prev => prev.map(t => t.id === parseInt(ticketId) ? updatedTicket : t));

      // Применяем фильтры
      applyFilters(tickets.map(t => t.id === parseInt(ticketId) ? updatedTicket : t), filters);

      return updatedTicket;
    } catch (err) {
      setError(err.message || 'Ошибка изменения статуса');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Добавим функцию addComment
  const addComment = async (ticketId, text) => {
    try {
      setLoading(true);
      setError(null);

      // Получаем текущую заявку
      const ticket = tickets.find(t => t.id === parseInt(ticketId));

      if (!ticket) {
        throw new Error('Заявка не найдена');
      }

      // Получаем данные пользователя
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Создаем новый комментарий
      const newComment = {
        id: (ticket.comments && ticket.comments.length > 0)
          ? Math.max(...ticket.comments.map(c => c.id)) + 1
          : 1,
        text,
        createdBy: {
          id: user.id || 1,
          name: user.name || 'Пользователь'
        },
        createdAt: new Date().toISOString()
      };

      // Обновляем заявку с новым комментарием
      const updatedTicket = {
        ...ticket,
        comments: [...(ticket.comments || []), newComment],
        updatedAt: new Date().toISOString()
      };

      // В реальном приложении здесь был бы API-запрос
      const result = await ticketService.addComment(ticketId, text);

      // Обновляем состояние
      setTickets(prev => prev.map(t => t.id === parseInt(ticketId) ? updatedTicket : t));

      // Применяем фильтры
      applyFilters(tickets.map(t => t.id === parseInt(ticketId) ? updatedTicket : t), filters);

      return newComment;
    } catch (err) {
      setError(err.message || 'Ошибка добавления комментария');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    tickets: filteredTickets,
    allTickets: tickets,
    loading,
    error,
    filters,
    fetchTickets,
    updateFilters,
    createTicket,
    getTicketById,
    updateTicket,
    deleteTicket,
    addComment,     // Добавили
    changeStatus,   // Добавили
    assignTicket,
  }

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>
}
