import { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
    category: '',
    search: '',
    assignedTo: '',
    createdBy: ''
  })

  // Refs для оптимизации
  const lastFetchTime = useRef(0)
  const isFirstLoad = useRef(true)
  const activeRequests = useRef(new Map())
  const CACHE_DURATION = 30000 // 30 секунд

  // Функция для отмены активных запросов
  const cancelActiveRequests = useCallback(() => {
    activeRequests.current.forEach((controller) => {
      controller.abort()
    })
    activeRequests.current.clear()
  }, [])

  // Применение фильтров
  const applyFilters = useCallback((ticketsArray, filterOptions) => {
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

    if (filterOptions.category) {
      filtered = filtered.filter(ticket => ticket.category === filterOptions.category)
    }

    if (filterOptions.assignedTo) {
      filtered = filtered.filter(ticket =>
        ticket.assignedTo && ticket.assignedTo.id === filterOptions.assignedTo
      )
    }

    if (filterOptions.createdBy) {
      filtered = filtered.filter(ticket =>
        ticket.createdBy && ticket.createdBy.id === filterOptions.createdBy
      )
    }

    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase()
      filtered = filtered.filter(
        ticket =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower) ||
          (ticket.assignedTo && ticket.assignedTo.name.toLowerCase().includes(searchLower)) ||
          (ticket.createdBy && ticket.createdBy.name.toLowerCase().includes(searchLower))
      )
    }

    setFilteredTickets(filtered)
  }, [])

  // Обновление фильтров
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    applyFilters(tickets, updatedFilters)
  }, [filters, tickets, applyFilters])

  // Загрузка всех заявок с кешированием
  const fetchTickets = useCallback(async (forceReload = false) => {
    const now = Date.now()

    // Проверяем кеш только если не принудительная перезагрузка
    if (!forceReload && tickets.length > 0 && (now - lastFetchTime.current < CACHE_DURATION)) {
      console.log('Используем кешированные данные')
      return
    }

    // Отменяем предыдущие запросы
    if (activeRequests.current.has('fetchTickets')) {
      activeRequests.current.get('fetchTickets').abort()
    }

    const controller = new AbortController()
    activeRequests.current.set('fetchTickets', controller)

    try {
      setLoading(true)
      setError(null)
      const data = await ticketService.getAllTickets({ signal: controller.signal })

      if (!controller.signal.aborted) {
        setTickets(data)
        applyFilters(data, filters)
        lastFetchTime.current = now
        isFirstLoad.current = false
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err.message || 'Ошибка загрузки заявок')
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
      activeRequests.current.delete('fetchTickets')
    }
  }, [tickets.length, filters, applyFilters])

  // Создание новой заявки
  const createTicket = useCallback(async (ticketData) => {
    try {
      setLoading(true)
      setError(null)
      const newTicket = await ticketService.createTicket(ticketData)

      // Обновляем локальное состояние для быстрого отображения
      setTickets(prev => [newTicket, ...prev])
      applyFilters([newTicket, ...tickets], filters)

      // Перезагружаем данные с сервера для синхронизации
      await fetchTickets(true)

      return newTicket
    } catch (err) {
      setError(err.message || 'Ошибка создания заявки')
      throw err
    } finally {
      setLoading(false)
    }
  }, [tickets, filters, applyFilters, fetchTickets])

  // Получение заявки по ID с кешированием
  const getTicketById = useCallback(async (id) => {
    // Сначала проверяем кеш
    const cachedTicket = tickets.find(t => t.id === id || t.id === parseInt(id))
    if (cachedTicket) {
      return cachedTicket
    }

    // Отменяем предыдущий запрос для этого ID
    const requestKey = `getTicket-${id}`
    if (activeRequests.current.has(requestKey)) {
      activeRequests.current.get(requestKey).abort()
    }

    const controller = new AbortController()
    activeRequests.current.set(requestKey, controller)

    try {
      setLoading(true)
      setError(null)
      const ticket = await ticketService.getTicketById(id, { signal: controller.signal })

      if (!controller.signal.aborted) {
        // Обновляем кеш
        setTickets(prev => {
          const exists = prev.find(t => t.id === ticket.id)
          if (exists) {
            return prev.map(t => t.id === ticket.id ? ticket : t)
          }
          return [ticket, ...prev]
        })

        return ticket
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err.message || 'Ошибка получения заявки')
      }
      throw err
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
      activeRequests.current.delete(requestKey)
    }
  }, [tickets])

  // Обновление заявки
  const updateTicket = useCallback(async (id, ticketData) => {
    try {
      setLoading(true)
      setError(null)
      const updatedTicket = await ticketService.updateTicket(id, ticketData)

      // Обновляем локальное состояние
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
  }, [tickets, filters, applyFilters])

  // Удаление заявки
  const deleteTicket = useCallback(async (id) => {
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
  }, [tickets, filters, applyFilters])

  // Добавление комментария
  const addComment = useCallback(async (ticketId, text) => {
    try {
      setLoading(true)
      setError(null)

      const comment = await ticketService.addComment(ticketId, text)

      // Обновляем локальное состояние
      setTickets(prev => prev.map(ticket => {
        if (ticket.id === ticketId || ticket.id === parseInt(ticketId)) {
          return {
            ...ticket,
            comments: [...(ticket.comments || []), comment],
            updatedAt: new Date().toISOString()
          }
        }
        return ticket
      }))

      return comment
    } catch (err) {
      setError(err.message || 'Ошибка добавления комментария')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Изменение статуса
  const changeStatus = useCallback(async (ticketId, status, comment = '') => {
    try {
      setLoading(true)
      setError(null)

      const updatedTicket = await ticketService.changeStatus(ticketId, status, comment)

      // Обновляем локальное состояние
      setTickets(prev => prev.map(t =>
        t.id === ticketId || t.id === parseInt(ticketId) ? updatedTicket : t
      ))

      // Применяем фильтры к обновленному списку
      applyFilters(tickets.map(t =>
        t.id === ticketId || t.id === parseInt(ticketId) ? updatedTicket : t
      ), filters)

      return updatedTicket
    } catch (err) {
      setError(err.message || 'Ошибка изменения статуса')
      throw err
    } finally {
      setLoading(false)
    }
  }, [tickets, filters, applyFilters])

  // Назначение исполнителя
  const assignTicket = useCallback(async (ticketId, userId, userName) => {
    try {
      setLoading(true)
      setError(null)

      const updatedTicket = await ticketService.assignTicket(ticketId, userId)

      // Обновляем локальное состояние
      setTickets(prev => prev.map(t =>
        t.id === ticketId || t.id === parseInt(ticketId) ? updatedTicket : t
      ))

      // Применяем фильтры к обновленному списку
      applyFilters(tickets.map(t =>
        t.id === ticketId || t.id === parseInt(ticketId) ? updatedTicket : t
      ), filters)

      return updatedTicket
    } catch (err) {
      setError(err.message || 'Ошибка назначения исполнителя')
      throw err
    } finally {
      setLoading(false)
    }
  }, [tickets, filters, applyFilters])

  // Загружаем заявки при первом рендере
  useEffect(() => {
    if (isFirstLoad.current) {
      fetchTickets()
    }
  }, [fetchTickets])

  // Cleanup функция
  useEffect(() => {
    return () => {
      cancelActiveRequests()
    }
  }, [cancelActiveRequests])

  // Мемоизируем значение контекста
  const value = useMemo(() => ({
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
    addComment,
    changeStatus,
    assignTicket,
  }), [
    filteredTickets,
    tickets,
    loading,
    error,
    filters,
    fetchTickets,
    updateFilters,
    createTicket,
    getTicketById,
    updateTicket,
    deleteTicket,
    addComment,
    changeStatus,
    assignTicket
  ])

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>
}
