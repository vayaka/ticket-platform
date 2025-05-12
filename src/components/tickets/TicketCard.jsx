// src/components/tickets/TicketCard.jsx
import { Card, Badge, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FaEye, FaCalendarAlt, FaUserAlt, FaTag, FaClock } from 'react-icons/fa'

// Проверяем, просрочен ли дедлайн
const isOverdue = (dueDate) => {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

const TicketCard = ({
  ticket,
  getStatusName,
  getPriorityName,
  getCategoryName,
  getStatusVariant,
  getPriorityVariant,
  formatDate,
}) => {
  // Убедимся, что у нас есть валидный объект заявки
  if (!ticket) return null

  // Получаем правильное значение ID
  const ticketId = ticket.id || ticket._id

  // Определяем статус дедлайна
  const overdueStatus = ticket.dueDate && isOverdue(ticket.dueDate)

  return (
    <Card
      className={`ticket-card h-100 shadow-sm priority-${ticket.priority} ${overdueStatus ? 'border-danger' : ''}`}
      style={{
        borderLeft: `4px solid var(--bs-${getPriorityVariant(ticket.priority)})`,
        transition: 'transform 0.2s',
      }}
    >
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <Badge bg={getPriorityVariant(ticket.priority)} className="me-2">
            {getPriorityName(ticket.priority)}
          </Badge>
          <Badge bg={getStatusVariant(ticket.status)}>
            {getStatusName(ticket.status)}
          </Badge>

          {/* Если есть комментарии, отображаем их количество */}
          {ticket.comments && ticket.comments.length > 0 && (
            <Badge bg="secondary" className="ms-2">
              {ticket.comments.length} комм.
            </Badge>
          )}
        </div>
        <small className="text-muted">#{ticketId}</small>
      </Card.Header>
      <Card.Body>
        <Card.Title className="mb-3 text-truncate" title={ticket.title}>
          {ticket.title}
        </Card.Title>
        <Card.Text
          className="mb-3 overflow-hidden"
          style={{ height: '3em', textOverflow: 'ellipsis' }}
          title={ticket.description}
        >
          {ticket.description}
        </Card.Text>
        <div className="mb-2 small">
          <FaTag className="me-1" /> {getCategoryName(ticket.category)}
        </div>
        <div className="mb-2 small">
          <FaUserAlt className="me-1" /> {ticket.assignedTo
            ? ticket.assignedTo.name
            : 'Не назначен'}
        </div>
        <div className="mb-2 small text-muted">
          <FaCalendarAlt className="me-1" /> Создана: {formatDate(ticket.createdAt)}
        </div>
        {ticket.dueDate && (
          <div className={`mb-2 small ${overdueStatus ? 'text-danger fw-bold' : ''}`}>
            <FaClock className="me-1" />
            {overdueStatus ? 'Просрочена: ' : 'Дедлайн: '}
            {formatDate(ticket.dueDate)}
          </div>
        )}

        {/* Отображение количества вложений, если они есть */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mb-2 small text-muted">
            <i className="bi bi-paperclip me-1"></i> {ticket.attachments.length} файл(ов)
          </div>
        )}
      </Card.Body>
      <Card.Footer className="bg-white">
        <Link
          to={`/tickets/${ticketId}`}
          className="btn btn-outline-primary btn-sm w-100"
        >
          <FaEye className="me-1" /> Просмотреть
        </Link>
      </Card.Footer>
    </Card>
  )
}

export default TicketCard
