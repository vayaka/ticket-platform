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
  }

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>
}
