import { useContext, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Row, Col, Button, Alert } from 'react-bootstrap'
import { FaPlus } from 'react-icons/fa'
import { TicketContext } from '../contexts/TicketContext'
import { AuthContext } from '../contexts/AuthContext'
import TicketList from '../components/tickets/TicketList'

const TicketsPage = () => {
  const location = useLocation()
  const { fetchTickets } = useContext(TicketContext)
  const { user } = useContext(AuthContext)

  // Проверяем, есть ли сообщение об успехе в location state
  const success = location.state?.success ? location.state.message : null

  useEffect(() => {
    // Загружаем заявки при монтировании компонента
    fetchTickets()
  }, [fetchTickets])

  return (
    <div>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h2>Мои заявки</h2>
        <Link to="/tickets/create" className="btn btn-primary">
          <FaPlus className="me-2" /> Создать заявку
        </Link>
      </div>

      {success && (
        <Alert
          variant="success"
          className="mb-4"
          dismissible
        >
          {success}
        </Alert>
      )}

      <TicketList />
    </div>
  )
}

export default TicketsPage
