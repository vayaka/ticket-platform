import { useContext } from 'react'
import { TicketContext } from '../contexts/TicketContext'

/**
 * Хук для доступа к контексту заявок
 * @returns {Object} Объект контекста заявок
 */
const useTickets = () => {
  const context = useContext(TicketContext)

  if (!context) {
    throw new Error('useTickets должен использоваться внутри TicketProvider')
  }

  return context
}

export default useTickets
