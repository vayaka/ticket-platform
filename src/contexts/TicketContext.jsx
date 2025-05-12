// src/contexts/TicketContext.jsx
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

  // ДОБАВЛЯЕМ ФУНКЦИЮ normalizeId
  // Нормализация ID для совместимости с MongoDB
  const normalizeId = useCallback((obj) => {
    if (!obj) return null
    return obj._id ? { ...obj, id: obj._id } : obj
  }, [])

  // Нормализация массива заявок
  const normalizeTickets = useCallback((ticketsArray) => {
    if (!ticketsArray || !Array.isArray(ticketsArray)) return []

    return ticketsArray.map(ticket => normalizeId(ticket))
  }, [normalizeId])

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
        ticket.assignedTo && (ticket.assignedTo.id === filterOptions.assignedTo ||
        ticket.assignedTo._id === filterOptions.assignedTo)
      )
    }

    if (filterOptions.createdBy) {
      filtered = filtered.filter(ticket =>
        ticket.createdBy && (ticket.createdBy.id === filterOptions.createdBy ||
        ticket.createdBy._id === filterOptions.createdBy)
      )
    }

    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase()
      filtered = filtered.filter(
        ticket =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower) ||
          (ticket.assignedTo && ticket.assignedTo.name?.toLowerCase().includes(searchLower)) ||
          (ticket.createdBy && ticket.createdBy.name?.toLowerCase().includes(searchLower))
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
        // Нормализуем данные заявок
        const normalizedTickets = normalizeTickets(data)
        setTickets(normalizedTickets)
        applyFilters(normalizedTickets, filters)
        lastFetchTime.current = now
        isFirstLoad.current = false
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error('Ошибка загрузки заявок:', err)
        setError(err.message || 'Ошибка загрузки заявок')
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
      activeRequests.current.delete('fetchTickets')
    }
  }, [tickets.length, filters, applyFilters, normalizeTickets])

  // Получение заявки по ID с кешированием
  const getTicketById = useCallback(async (id) => {
    if (!id) {
      console.error('ID заявки не указан')
      return null
    }

    // Сначала проверяем кеш
    const cachedTicket = tickets.find(t =>
      t.id === id ||
      t.id === parseInt(id) ||
      t._id === id ||
      t._id === parseInt(id)
    )

    if (cachedTicket) {
      console.log('Возврат закешированной заявки:', cachedTicket)
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

      // Сохраняем ID в нескольких форматах для надежности
      const stringId = String(id).trim()
      const numericId = parseInt(stringId, 10)

      // Создаем массив попыток с разными форматами ID
      const attempts = [
        () => ticketService.getTicketById(stringId, { signal: controller.signal }),
        () => ticketService.getTicketById(numericId, { signal: controller.signal }),
        () => ticketService.getTicketById(stringId.replace(/"/g, ''), { signal: controller.signal })
      ]

      // Перебираем попытки, пока не получим успешный результат
      let ticket = null
      let lastError = null

      for (const attempt of attempts) {
        if (controller.signal.aborted) break

        try {
          ticket = await attempt()
          if (ticket) break
        } catch (err) {
          lastError = err
          console.warn(`Попытка получения заявки не удалась: ${err.message}`)
        }
      }

      // Если после всех попыток нет результата, выбрасываем ошибку
      if (!ticket) {
        throw lastError || new Error(`Не удалось найти заявку с ID ${id}`)
      }

      if (!controller.signal.aborted) {
        // Нормализуем полученную заявку
        const normalizedTicket = normalizeId(ticket)

        // Обновляем кеш
        setTickets(prev => {
          const exists = prev.find(t =>
            t.id === normalizedTicket.id ||
            t._id === normalizedTicket.id ||
            t.id === normalizedTicket._id ||
            t._id === normalizedTicket._id
          )

          if (exists) {
            return prev.map(t =>
              (t.id === normalizedTicket.id ||
               t._id === normalizedTicket.id ||
               t.id === normalizedTicket._id ||
               t._id === normalizedTicket._id) ? normalizedTicket : t
            )
          }

          return [normalizedTicket, ...prev]
        })

        return normalizedTicket
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error(`Ошибка получения заявки ${id}:`, err)
        setError(err.message || 'Ошибка получения заявки')
      }
      throw err
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
      activeRequests.current.delete(requestKey)
    }
  }, [tickets, normalizeId])

  // Создание новой заявки
  const createTicket = useCallback(async (ticketData) => {
    try {
      setLoading(true)
      setError(null)
      const newTicket = await ticketService.createTicket(ticketData)

      // Нормализуем полученную заявку
      const normalizedTicket = normalizeId(newTicket)

      // Обновляем локальное состояние для быстрого отображения
      setTickets(prev => [normalizedTicket, ...prev])
      applyFilters([normalizedTicket, ...tickets], filters)

      // Перезагружаем данные с сервера для синхронизации
      await fetchTickets(true)

      return normalizedTicket
    } catch (err) {
      console.error('Ошибка создания заявки:', err)
      setError(err.message || 'Ошибка создания заявки')
      throw err
    } finally {
      setLoading(false)
    }
  }, [tickets, filters, applyFilters, fetchTickets, normalizeId])

  // Обновление заявки
  const updateTicket = useCallback(async (id, ticketData) => {
    try {
      setLoading(true)
      setError(null)
      const updatedTicket = await ticketService.updateTicket(id, ticketData)

      // Нормализуем полученную заявку
      const normalizedTicket = normalizeId(updatedTicket)

      // Обновляем локальное состояние
      setTickets(prev =>
        prev.map(ticket =>
          (ticket.id === id ||
           ticket._id === id ||
           ticket.id === normalizedTicket.id ||
           ticket._id === normalizedTicket.id) ? normalizedTicket : ticket
        )
      )

      // Применяем фильтры к обновленным данным
      const updatedTickets = tickets.map(ticket =>
        (ticket.id === id ||
         ticket._id === id ||
         ticket.id === normalizedTicket.id ||
         ticket._id === normalizedTicket.id) ? normalizedTicket : ticket
      )

      applyFilters(updatedTickets, filters)

      return normalizedTicket
    } catch (err) {
      console.error(`Ошибка обновления заявки ${id}:`, err)
      setError(err.message || 'Ошибка обновления заявки')
      throw err
    } finally {
      setLoading(false)
    }
  }, [tickets, filters, applyFilters, normalizeId])

  // Удаление заявки
  const deleteTicket = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      await ticketService.deleteTicket(id)

      // Удаляем заявку из локального состояния
      const updatedTickets = tickets.filter(ticket =>
        ticket.id !== id &&
        ticket._id !== id
      )

      setTickets(updatedTickets)
      applyFilters(updatedTickets, filters)

      return true
    } catch (err) {
      console.error(`Ошибка удаления заявки ${id}:`, err)
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
      // Нормализуем комментарий
      const normalizedComment = normalizeId(comment)

      // Обновляем локальное состояние
      setTickets(prev => prev.map(ticket => {
        if (ticket.id === ticketId ||
            ticket._id === ticketId ||
            ticket.id === parseInt(ticketId)) {
          return {
            ...ticket,
            comments: [...(ticket.comments || []), normalizedComment],
            updatedAt: new Date().toISOString()
          }
        }
        return ticket
      }))

      return normalizedComment
    } catch (err) {
      console.error(`Ошибка добавления комментария к заявке ${ticketId}:`, err)
      setError(err.message || 'Ошибка добавления комментария')
      throw err
    } finally {
      setLoading(false)
    }
  }, [normalizeId])

  // Изменение статуса
  const changeStatus = useCallback(async (ticketId, status, comment = '') => {
    try {
      setLoading(true)
      setError(null)

      const updatedTicket = await ticketService.changeStatus(ticketId, status, comment)

      // Нормализуем полученную заявку
      const normalizedTicket = normalizeId(updatedTicket)

      // Обновляем локальное состояние
      setTickets(prev => prev.map(t =>
        (t.id === ticketId ||
         t._id === ticketId ||
         t.id === parseInt(ticketId)) ? normalizedTicket : t
      ))

      // Применяем фильтры к обновленному списку
      const updatedTickets = tickets.map(t =>
        (t.id === ticketId ||
         t._id === ticketId ||
         t.id === parseInt(ticketId)) ? normalizedTicket : t
      )

      applyFilters(updatedTickets, filters)

      return normalizedTicket
    } catch (err) {
      console.error(`Ошибка изменения статуса заявки ${ticketId}:`, err)
      setError(err.message || 'Ошибка изменения статуса')
      throw err
    } finally {
      setLoading(false)
    }
  }, [tickets, filters, applyFilters, normalizeId])

  // Назначение исполнителя
  const assignTicket = useCallback(async (ticketId, userId) => {
    try {
      setLoading(true)
      setError(null)

      const updatedTicket = await ticketService.assignTicket(ticketId, userId)

      // Нормализуем полученную заявку
      const normalizedTicket = normalizeId(updatedTicket)

      // Обновляем локальное состояние
      setTickets(prev => prev.map(t =>
        (t.id === ticketId ||
         t._id === ticketId ||
         t.id === parseInt(ticketId)) ? normalizedTicket : t
      ))

      // Применяем фильтры к обновленному списку
      const updatedTickets = tickets.map(t =>
        (t.id === ticketId ||
         t._id === ticketId ||
         t.id === parseInt(ticketId)) ? normalizedTicket : t
      )

      applyFilters(updatedTickets, filters)

      return normalizedTicket
    } catch (err) {
      console.error(`Ошибка назначения исполнителя для заявки ${ticketId}:`, err)
      setError(err.message || 'Ошибка назначения исполнителя')
      throw err
    } finally {
      setLoading(false)
    }
  }, [tickets, filters, applyFilters, normalizeId])

  // Удаление вложения
  const deleteAttachment = useCallback(async (ticketId, attachmentId) => {
    try {
      setLoading(true)
      setError(null)

      await ticketService.deleteAttachment(ticketId, attachmentId)

      // Обновляем локальное состояние
      setTickets(prev => prev.map(ticket => {
        if (ticket.id === ticketId ||
            ticket._id === ticketId ||
            ticket.id === parseInt(ticketId)) {
          return {
            ...ticket,
            attachments: ticket.attachments.filter(a =>
              a.id !== attachmentId &&
              a._id !== attachmentId
            )
          }
        }
        return ticket
      }))

      return true
    } catch (err) {
      console.error(`Ошибка удаления вложения ${attachmentId} из заявки ${ticketId}:`, err)
      setError(err.message || 'Ошибка удаления вложения')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Загружаем заявки при первом рендере
  useEffect(() => {
    if (isFirstLoad.current) {
      fetchTickets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup функция
  useEffect(() => {
    return () => {
      cancelActiveRequests()
    }
  }, [cancelActiveRequests])

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null)
  }, [])

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
    deleteAttachment,
    clearError
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
    assignTicket,
    deleteAttachment,
    clearError
  ])

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>
}
