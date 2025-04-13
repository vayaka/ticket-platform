import { Card, Badge, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FaEye, FaCalendarAlt, FaUserAlt, FaTag } from 'react-icons/fa'

const TicketCard = ({
  ticket,
  getStatusName,
  getPriorityName,
  getCategoryName,
  getStatusVariant,
  getPriorityVariant,
  formatDate,
}) => {
  return (
    <Card
      className={`ticket-card h-100 shadow-sm priority-${ticket.priority}`}
      style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
    >
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <Badge bg={getPriorityVariant(ticket.priority)} className="me-2">
            {getPriorityName(ticket.priority)}
          </Badge>
          <Badge bg={getStatusVariant(ticket.status)}>
            {getStatusName(ticket.status)}
          </Badge>
        </div>
        <small className="text-muted">#{ticket.id}</small>
      </Card.Header>
      <Card.Body>
        <Card.Title className="mb-3">{ticket.title}</Card.Title>
        <Card.Text className="text-truncate mb-3" title={ticket.description}>
          {ticket.description}
        </Card.Text>
        <div className="mb-2 small">
          <FaTag className="me-1" /> {getCategoryName(ticket.category)}
        </div>
        <div className="mb-2 small">
          <FaUserAlt className="me-1" /> {ticket.assignedTo ? ticket.assignedTo.name : 'Не назначен'}
        </div>
        <div className="mb-2 small text-muted">
          <FaCalendarAlt className="me-1" /> Создана: {formatDate(ticket.createdAt)}
        </div>
        {ticket.dueDate && (
          <div className="mb-2 small text-danger">
            <FaCalendarAlt className="me-1" /> Дедлайн: {formatDate(ticket.dueDate)}
          </div>
        )}
      </Card.Body>
      <Card.Footer className="bg-white">
        <Link
          to={`/tickets/${ticket.id}`}
          className="btn btn-outline-primary btn-sm w-100"
        >
          <FaEye className="me-1" /> Просмотреть
        </Link>
      </Card.Footer>
    </Card>
  )
}

export default TicketCard
