import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Card, Button, Badge } from 'react-bootstrap'
import { FaPlus, FaTicketAlt, FaList, FaChartBar, FaUserCog, FaRegClock } from 'react-icons/fa'
import { TicketContext } from '../contexts/TicketContext'
import { AuthContext } from '../contexts/AuthContext'
import Loader from '../components/common/Loader'

const HomePage = () => {
  const { user } = useContext(AuthContext)
  const { allTickets, fetchTickets, loading } = useContext(TicketContext)
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    completed: 0,
    myAssigned: 0,
    myCreated: 0,
  })

  useEffect(() => {
    // Загружаем заявки при монтировании компонента
    fetchTickets()
  }, [fetchTickets])

  useEffect(() => {
    // Рассчитываем статистику при изменении списка заявок
    if (allTickets) {
      setStats({
        total: allTickets.length,
        new: allTickets.filter(t => t.status === 'new').length,
        inProgress: allTickets.filter(t => t.status === 'in-progress').length,
        completed: allTickets.filter(t => t.status === 'completed').length,
        myAssigned: allTickets.filter(t => t.assignedTo?.id === user?.id).length,
        myCreated: allTickets.filter(t => t.createdBy?.id === user?.id).length,
      })
    }
  }, [allTickets, user])

  // Получаем заявки с приближающимся дедлайном
  const getUpcomingDeadlineTickets = () => {
    const now = new Date()
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // +3 дня

    return allTickets
      .filter(ticket => {
        if (!ticket.dueDate) return false
        const dueDate = new Date(ticket.dueDate)
        return dueDate >= now && dueDate <= threeDaysLater && ticket.status !== 'completed'
      })
      .slice(0, 5) // Ограничиваем 5 заявками
  }

  // Получаем недавно созданные заявки
  const getRecentTickets = () => {
    return [...allTickets]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5) // Ограничиваем 5 заявками
  }

  // Получаем цвет для статуса заявки
  const getStatusVariant = (status) => {
    switch (status) {
      case 'new': return 'primary'
      case 'assigned': return 'info'
      case 'in-progress': return 'warning'
      case 'completed': return 'success'
      default: return 'secondary'
    }
  }

  // Получаем цвет для приоритета заявки
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'critical': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'info'
      case 'low': return 'success'
      default: return 'secondary'
    }
  }

  // Локализация статусов
  const getStatusName = (status) => {
    switch (status) {
      case 'new': return 'Новая'
      case 'assigned': return 'Назначена'
      case 'in-progress': return 'В работе'
      case 'completed': return 'Выполнена'
      default: return status
    }
  }

  // Локализация приоритетов
  const getPriorityName = (priority) => {
    switch (priority) {
      case 'critical': return 'Критический'
      case 'high': return 'Высокий'
      case 'medium': return 'Средний'
      case 'low': return 'Низкий'
      default: return priority
    }
  }

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (loading && allTickets.length === 0) {
    return <Loader />
  }

  return (
    <div>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h2>Добро пожаловать, {user?.name}!</h2>
        <Link to="/tickets/create" className="btn btn-primary">
          <FaPlus className="me-1" /> Создать заявку
        </Link>
      </div>

      {/* Блок статистики */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm ticket-card bg-light">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle p-3 bg-primary text-white me-3">
                <FaTicketAlt size={24} />
              </div>
              <div>
                <div className="text-muted small">Всего заявок</div>
                <h3 className="mb-0">{stats.total}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm ticket-card bg-light">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle p-3 bg-info text-white me-3">
                <FaTicketAlt size={24} />
              </div>
              <div>
                <div className="text-muted small">Новых заявок</div>
                <h3 className="mb-0">{stats.new}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm ticket-card bg-light">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle p-3 bg-warning text-white me-3">
                <FaList size={24} />
              </div>
              <div>
                <div className="text-muted small">В работе</div>
                <h3 className="mb-0">{stats.inProgress}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm ticket-card bg-light">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle p-3 bg-success text-white me-3">
                <FaChartBar size={24} />
              </div>
              <div>
                <div className="text-muted small">Выполнено</div>
                <h3 className="mb-0">{stats.completed}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        {/* Персональная статистика */}
        {(user?.role === 'admin' || user?.role === 'moderator' || stats.myAssigned > 0) && (
          <Col lg={6} xl={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <FaUserCog className="me-2" /> Мои задачи
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Назначенных мне заявок:</span>
                    <span>{stats.myAssigned}</span>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar bg-info"
                      style={{ width: `${stats.myAssigned > 0 ? 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Созданных мной заявок:</span>
                    <span>{stats.myCreated}</span>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar bg-primary"
                      style={{ width: `${stats.myCreated > 0 ? 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Link to="/tickets" className="btn btn-outline-primary">
                    Мои заявки
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Заявки с приближающимся дедлайном */}
        <Col lg={6} xl={user?.role === 'user' ? 6 : 4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaRegClock className="me-2" /> Приближающиеся дедлайны
              </h5>
            </Card.Header>
            <Card.Body>
              {getUpcomingDeadlineTickets().length === 0 ? (
                <div className="text-center text-muted py-4">
                  <p>Нет заявок с приближающимся дедлайном</p>
                </div>
              ) : (
                <div className="list-group">
                  {getUpcomingDeadlineTickets().map(ticket => (
                    <Link
                      key={ticket.id}
                      to={`/tickets/${ticket.id}`}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3"
                    >
                      <div>
                        <div className="d-flex align-items-center mb-1">
                          <Badge bg={getPriorityVariant(ticket.priority)} className="me-2">
                            {getPriorityName(ticket.priority)}
                          </Badge>
                          <span className="small text-truncate">{ticket.title}</span>
                        </div>
                        <div className="small text-danger">
                          Дедлайн: {formatDate(ticket.dueDate)}
                        </div>
                      </div>
                      <Badge bg={getStatusVariant(ticket.status)}>
                        {getStatusName(ticket.status)}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Недавно созданные заявки */}
        <Col lg={user?.role === 'user' ? 12 : 6} xl={user?.role === 'user' ? 6 : 4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaTicketAlt className="me-2" /> Недавние заявки
              </h5>
            </Card.Header>
            <Card.Body>
              {getRecentTickets().length === 0 ? (
                <div className="text-center text-muted py-4">
                  <p>Нет недавно созданных заявок</p>
                </div>
              ) : (
                <div className="list-group">
                  {getRecentTickets().map(ticket => (
                    <Link
                      key={ticket.id}
                      to={`/tickets/${ticket.id}`}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3"
                    >
                      <div>
                        <div className="mb-1">{ticket.title}</div>
                        <div className="small text-muted">
                          Создана: {formatDate(ticket.createdAt)}
                        </div>
                      </div>
                      <Badge bg={getStatusVariant(ticket.status)}>
                        {getStatusName(ticket.status)}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </Card.Body>
            <Card.Footer className="bg-white text-center">
              <Link to="/tickets" className="btn btn-outline-primary btn-sm">
                Показать все заявки
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default HomePage
