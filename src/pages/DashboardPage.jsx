import { useContext, useState, useEffect } from 'react'
import { Card, Row, Col, Table, Badge, Button, Tabs, Tab } from 'react-bootstrap'
import { TicketContext } from '../contexts/TicketContext'
import { AuthContext } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { FaTicketAlt, FaUsers, FaChartLine, FaCalendarAlt, FaClock } from 'react-icons/fa'
import Loader from '../components/common/Loader'

const DashboardPage = () => {
  const { allTickets, fetchTickets, loading } = useContext(TicketContext)
  const { user } = useContext(AuthContext)
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    criticalPriority: 0,
    ticketsByDepartment: {},
    ticketsByUser: {},
    averageResolutionTime: 0
  })

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  useEffect(() => {
    if (allTickets) {
      // Базовая статистика
      const newTickets = allTickets.filter(t => t.status === 'new')
      const inProgressTickets = allTickets.filter(t => t.status === 'in-progress')
      const completedTickets = allTickets.filter(t => t.status === 'completed')
      const overdueTickets = allTickets.filter(t => {
        if (!t.dueDate) return false
        return new Date(t.dueDate) < new Date() && t.status !== 'completed'
      })
      const criticalTickets = allTickets.filter(t => t.priority === 'critical')

      // Статистика по отделам
      const ticketsByDepartment = allTickets.reduce((acc, ticket) => {
        const dept = ticket.department
        if (!acc[dept]) acc[dept] = 0
        acc[dept]++
        return acc
      }, {})

      // Статистика по исполнителям
      const ticketsByUser = allTickets.reduce((acc, ticket) => {
        if (!ticket.assignedTo) return acc
        const userId = ticket.assignedTo.id
        const userName = ticket.assignedTo.name
        if (!acc[userId]) {
          acc[userId] = {
            name: userName,
            count: 0,
            completed: 0
          }
        }
        acc[userId].count++
        if (ticket.status === 'completed') {
          acc[userId].completed++
        }
        return acc
      }, {})

      // Среднее время выполнения (для демо просто случайное число)
      const avgTime = Math.floor(Math.random() * 48) + 24 // от 24 до 72 часов

      setStats({
        total: allTickets.length,
        new: newTickets.length,
        inProgress: inProgressTickets.length,
        completed: completedTickets.length,
        overdue: overdueTickets.length,
        criticalPriority: criticalTickets.length,
        ticketsByDepartment,
        ticketsByUser,
        averageResolutionTime: avgTime
      })
    }
  }, [allTickets])

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

  if (loading && allTickets.length === 0) {
    return <Loader />
  }

  return (
    <div>
      <h2 className="mb-4">Панель управления</h2>

      {/* Обзорная статистика */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm bg-light">
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
          <Card className="h-100 shadow-sm bg-light">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle p-3 bg-warning text-white me-3">
                <FaClock size={24} />
              </div>
              <div>
                <div className="text-muted small">Просроченные</div>
                <h3 className="mb-0">{stats.overdue}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm bg-light">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle p-3 bg-danger text-white me-3">
                <FaTicketAlt size={24} />
              </div>
              <div>
                <div className="text-muted small">Критический приоритет</div>
                <h3 className="mb-0">{stats.criticalPriority}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm bg-light">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle p-3 bg-success text-white me-3">
                <FaChartLine size={24} />
              </div>
              <div>
                <div className="text-muted small">Ср. время решения</div>
                <h3 className="mb-0">{stats.averageResolutionTime} ч</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Табы с детальной информацией */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Tabs
            defaultActiveKey="tickets"
            className="mb-3"
          >
            {/* Вкладка с новыми заявками */}
            <Tab eventKey="tickets" title="Новые заявки">
              <h5 className="mb-3">Новые заявки (требуют назначения)</h5>
              {allTickets.filter(t => t.status === 'new').length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Название</th>
                      <th>Приоритет</th>
                      <th>Создана</th>
                      <th>Отдел</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTickets
                      .filter(t => t.status === 'new')
                      .slice(0, 5)
                      .map(ticket => (
                        <tr key={ticket.id}>
                          <td>#{ticket.id}</td>
                          <td>{ticket.title}</td>
                          <td>
                            <Badge bg={getPriorityVariant(ticket.priority)}>
                              {getPriorityName(ticket.priority)}
                            </Badge>
                          </td>
                          <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                          <td>{ticket.department}</td>
                          <td>
                            <Link
                              to={`/tickets/${ticket.id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              Просмотр
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center text-muted py-5">
                  <p>Нет новых заявок</p>
                </div>
              )}
              <div className="text-end">
                <Link to="/tickets?status=new" className="btn btn-outline-primary">
                  Показать все новые заявки
                </Link>
              </div>
            </Tab>

            {/* Вкладка с просроченными заявками */}
            <Tab eventKey="overdue" title="Просроченные">
              <h5 className="mb-3">Просроченные заявки</h5>
              {allTickets.filter(t => {
                if (!t.dueDate) return false
                return new Date(t.dueDate) < new Date() && t.status !== 'completed'
              }).length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Название</th>
                      <th>Приоритет</th>
                      <th>Дедлайн</th>
                      <th>Исполнитель</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTickets
                      .filter(t => {
                        if (!t.dueDate) return false
                        return new Date(t.dueDate) < new Date() && t.status !== 'completed'
                      })
                      .slice(0, 5)
                      .map(ticket => (
                        <tr key={ticket.id}>
                          <td>#{ticket.id}</td>
                          <td>{ticket.title}</td>
                          <td>
                            <Badge bg={getPriorityVariant(ticket.priority)}>
                              {getPriorityName(ticket.priority)}
                            </Badge>
                          </td>
                          <td className="text-danger">
                            {new Date(ticket.dueDate).toLocaleDateString()}
                          </td>
                          <td>{ticket.assignedTo?.name || 'Не назначен'}</td>
                          <td>
                            <Link
                              to={`/tickets/${ticket.id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              Просмотр
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center text-muted py-5">
                  <p>Нет просроченных заявок</p>
                </div>
              )}
            </Tab>

            {/* Вкладка с статистикой по отделам */}
            <Tab eventKey="departments" title="По отделам">
              <h5 className="mb-3">Распределение заявок по отделам</h5>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Отдел</th>
                    <th>Всего заявок</th>
                    <th>Новых</th>
                    <th>В работе</th>
                    <th>Выполнено</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.ticketsByDepartment).map(([dept, count]) => (
                    <tr key={dept}>
                      <td>{dept}</td>
                      <td>{count}</td>
                      <td>
                        {allTickets.filter(t => t.department === dept && t.status === 'new').length}
                      </td>
                      <td>
                        {allTickets.filter(t => t.department === dept && t.status === 'in-progress').length}
                      </td>
                      <td>
                        {allTickets.filter(t => t.department === dept && t.status === 'completed').length}
                      </td>
                      <td>
                        <Link
                          to={`/tickets?department=${dept}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          Просмотр
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>
            {/* Вкладка с сотрудниками */}
            <Tab eventKey="employees" title="Сотрудники">
              <h5 className="mb-3">Статистика по сотрудникам</h5>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Сотрудник</th>
                    <th>Всего назначено</th>
                    <th>Выполнено</th>
                    <th>Процент выполнения</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.ticketsByUser).map(([userId, data]) => (
                    <tr key={userId}>
                      <td>{data.name}</td>
                      <td>{data.count}</td>
                      <td>{data.completed}</td>
                      <td>
                        {data.count > 0
                          ? Math.round((data.completed / data.count) * 100) + '%'
                          : '0%'
                        }
                      </td>
                      <td>
                        <Link
                          to={`/users/${userId}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          Профиль
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            {/* Вкладка с графиками и диаграммами */}
            <Tab eventKey="charts" title="Графики">
              <h5 className="mb-3">Графическая статистика</h5>
              <Row>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header>Заявки по статусам</Card.Header>
                    <Card.Body className="text-center">
                      {/* В реальном приложении здесь будет график, например с библиотекой Chart.js */}
                      <div className="py-5">
                        <div className="mb-3">
                          <Badge bg="primary" className="p-2 me-2">Новые: {stats.new}</Badge>
                          <Badge bg="info" className="p-2 me-2">В работе: {stats.inProgress}</Badge>
                          <Badge bg="success" className="p-2">Выполнено: {stats.completed}</Badge>
                        </div>
                        <div className="progress" style={{ height: '30px' }}>
                          <div
                            className="progress-bar bg-primary"
                            style={{ width: `${stats.total ? (stats.new / stats.total) * 100 : 0}%` }}
                          />
                          <div
                            className="progress-bar bg-info"
                            style={{ width: `${stats.total ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                          />
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${stats.total ? (stats.completed / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header>Заявки по приоритетам</Card.Header>
                    <Card.Body className="text-center">
                      {/* В реальном приложении здесь будет график */}
                      <div className="py-5">
                        <div className="mb-3">
                          <Badge bg="danger" className="p-2 me-2">Критический: {stats.criticalPriority}</Badge>
                          <Badge bg="warning" className="p-2 me-2">Высокий: {allTickets.filter(t => t.priority === 'high').length}</Badge>
                          <Badge bg="info" className="p-2 me-2">Средний: {allTickets.filter(t => t.priority === 'medium').length}</Badge>
                          <Badge bg="success" className="p-2">Низкий: {allTickets.filter(t => t.priority === 'low').length}</Badge>
                        </div>
                        {/* Простая визуализация данных */}
                        <div className="progress" style={{ height: '30px' }}>
                          <div
                            className="progress-bar bg-danger"
                            style={{ width: `${stats.total ? (stats.criticalPriority / stats.total) * 100 : 0}%` }}
                          />
                          <div
                            className="progress-bar bg-warning"
                            style={{ width: `${stats.total ? (allTickets.filter(t => t.priority === 'high').length / stats.total) * 100 : 0}%` }}
                          />
                          <div
                            className="progress-bar bg-info"
                            style={{ width: `${stats.total ? (allTickets.filter(t => t.priority === 'medium').length / stats.total) * 100 : 0}%` }}
                          />
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${stats.total ? (allTickets.filter(t => t.priority === 'low').length / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Дополнительные блоки */}
      <Row>
        <Col lg={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Календарь дедлайнов</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-muted text-center py-5">
                <FaCalendarAlt size={40} className="mb-3 text-secondary" />
                <p>Здесь будет отображаться календарь дедлайнов заявок</p>
                <Button variant="outline-primary" disabled>
                  В разработке
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Управление пользователями</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-muted text-center py-5">
                <FaUsers size={40} className="mb-3 text-secondary" />
                <p>Здесь будет отображаться список пользователей и их права доступа</p>
                <Button variant="outline-primary" disabled>
                  В разработке
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
