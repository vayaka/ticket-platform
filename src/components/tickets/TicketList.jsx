// src/components/tickets/TicketList.jsx
import { useState, useContext, useEffect } from 'react'
import { Card, Table, Badge, Button, Form, Row, Col, InputGroup, Alert, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FaSearch, FaFilter, FaSort, FaEye, FaTimes, FaSpinner } from 'react-icons/fa'
import { TicketContext } from '../../contexts/TicketContext'
import { AuthContext } from '../../contexts/AuthContext'
import Loader from '../common/Loader'
import TicketCard from './TicketCard'

const TicketList = () => {
  const { tickets, loading, error, updateFilters, filters, fetchTickets } = useContext(TicketContext)
  const { user } = useContext(AuthContext)
  const [viewMode, setViewMode] = useState(localStorage.getItem('ticketViewMode') || 'table')
  const [localFilters, setLocalFilters] = useState(filters)
  const [applying, setApplying] = useState(false)

  // Обновляем локальное состояние при изменении фильтров в контексте
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Сохраняем режим просмотра в localStorage
  useEffect(() => {
    localStorage.setItem('ticketViewMode', viewMode)
  }, [viewMode])

  // Применение фильтров
  const applyFilters = async () => {
    try {
      setApplying(true)
      await updateFilters(localFilters)
    } catch (error) {
      console.error('Ошибка при применении фильтров:', error)
    } finally {
      setApplying(false)
    }
  }

  // Сброс фильтров
  const resetFilters = async () => {
    const resetFilters = {
      status: '',
      priority: '',
      department: '',
      category: '',
      search: '',
    }
    setLocalFilters(resetFilters)

    try {
      setApplying(true)
      await updateFilters(resetFilters)
    } catch (error) {
      console.error('Ошибка при сбросе фильтров:', error)
    } finally {
      setApplying(false)
    }
  }

  // Обработка изменения фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Обработка события Enter в поле поиска
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters()
    }
  }

  // Функция для обновления списка заявок
  const refreshTickets = async () => {
    try {
      await fetchTickets(true) // true - принудительное обновление
    } catch (error) {
      console.error('Ошибка при обновлении списка заявок:', error)
    }
  }

  // Нормализация ID для совместимости с MongoDB
  const normalizeId = (obj) => {
    if (!obj) return null
    return obj._id ? { ...obj, id: obj._id } : obj
  }

  // Получаем цвет для статуса заявки
  const getStatusVariant = (status) => {
    switch (status) {
      case 'new':
        return 'primary'
      case 'assigned':
        return 'info'
      case 'in-progress':
        return 'warning'
      case 'completed':
        return 'success'
      default:
        return 'secondary'
    }
  }

  // Получаем цвет для приоритета заявки
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'critical':
        return 'danger'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'success'
      default:
        return 'secondary'
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

  // Локализация статусов
  const getStatusName = (status) => {
    switch (status) {
      case 'new':
        return 'Новая'
      case 'assigned':
        return 'Назначена'
      case 'in-progress':
        return 'В работе'
      case 'completed':
        return 'Выполнена'
      default:
        return status
    }
  }

  // Локализация приоритетов
  const getPriorityName = (priority) => {
    switch (priority) {
      case 'critical':
        return 'Критический'
      case 'high':
        return 'Высокий'
      case 'medium':
        return 'Средний'
      case 'low':
        return 'Низкий'
      default:
        return priority
    }
  }

  // Локализация категорий
  const getCategoryName = (category) => {
    switch (category) {
      case 'hardware':
        return 'Оборудование'
      case 'software':
        return 'ПО'
      case 'network':
        return 'Сеть'
      case 'maintenance':
        return 'Тех. обслуживание'
      default:
        return 'Другое'
    }
  }

  if (loading && tickets.length === 0) {
    return <Loader fullPage />
  }

  return (
    <div>
      {/* Блок фильтров */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaFilter className="me-2" />
            Фильтры
          </h5>
          <div>
            <Button
              variant="outline-secondary"
              size="sm"
              className="me-2"
              onClick={resetFilters}
              disabled={applying}
            >
              <FaTimes className="me-1" /> Сбросить
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={applyFilters}
              disabled={applying}
            >
              {applying ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-1"
                  />
                  Применяем...
                </>
              ) : (
                <>
                  <FaFilter className="me-1" /> Применить
                </>
              )}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Статус</Form.Label>
                <Form.Select
                  name="status"
                  value={localFilters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Все статусы</option>
                  <option value="new">Новая</option>
                  <option value="assigned">Назначена</option>
                  <option value="in-progress">В работе</option>
                  <option value="completed">Выполнена</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Приоритет</Form.Label>
                <Form.Select
                  name="priority"
                  value={localFilters.priority}
                  onChange={handleFilterChange}
                >
                  <option value="">Все приоритеты</option>
                  <option value="critical">Критический</option>
                  <option value="high">Высокий</option>
                  <option value="medium">Средний</option>
                  <option value="low">Низкий</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Отдел</Form.Label>
                <Form.Select
                  name="department"
                  value={localFilters.department}
                  onChange={handleFilterChange}
                >
                  <option value="">Все отделы</option>
                  <option value="IT">IT</option>
                  <option value="HR">Кадры</option>
                  <option value="maintenance">Техническое обслуживание</option>
                  <option value="other">Другое</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Категория</Form.Label>
                <Form.Select
                  name="category"
                  value={localFilters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">Все категории</option>
                  <option value="hardware">Оборудование</option>
                  <option value="software">Программное обеспечение</option>
                  <option value="network">Сеть</option>
                  <option value="maintenance">Тех. обслуживание</option>
                  <option value="other">Другое</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Поиск</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    name="search"
                    value={localFilters.search}
                    onChange={handleFilterChange}
                    placeholder="Поиск по заявкам..."
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Поиск по названию, описанию и другим полям заявки
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Блок с результатами */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h5 className="mb-0 me-3">
              Найдено заявок: {tickets.length}
            </h5>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={refreshTickets}
              disabled={loading}
              title="Обновить список"
            >
              {loading ? <FaSpinner className="fa-spin" /> : <FaSort />}
            </Button>
          </div>
          <div className="btn-group">
            <Button
              variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('table')}
            >
              Таблица
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('cards')}
            >
              Карточки
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible>
              <Alert.Heading>Ошибка</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          {tickets.length === 0 ? (
            <div className="text-center py-5">
              <h5>Заявки не найдены</h5>
              <p className="text-muted">Измените критерии поиска или создайте новую заявку</p>
              <Link to="/tickets/create" className="btn btn-primary mt-2">
                Создать заявку
              </Link>
            </div>
          ) : viewMode === 'table' ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Статус</th>
                    <th>Приоритет</th>
                    <th>Отдел</th>
                    <th>Создана</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id || ticket._id} className={`priority-${ticket.priority}`}>
                      <td>#{ticket.id || ticket._id}</td>
                      <td className="text-truncate" style={{ maxWidth: '200px' }} title={ticket.title}>
                        {ticket.title}
                      </td>
                      <td>
                        <Badge bg={getStatusVariant(ticket.status)}>
                          {getStatusName(ticket.status)}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getPriorityVariant(ticket.priority)}>
                          {getPriorityName(ticket.priority)}
                        </Badge>
                      </td>
                      <td>{ticket.department}</td>
                      <td>{formatDate(ticket.createdAt)}</td>
                      <td>
                        <Link
                          to={`/tickets/${ticket.id || ticket._id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <FaEye className="me-1" /> Просмотр
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Row>
              {tickets.map((ticket) => (
                <Col key={ticket.id || ticket._id} xs={12} md={6} lg={4} className="mb-4">
                  <TicketCard
                    ticket={normalizeId(ticket)}
                    getStatusName={getStatusName}
                    getPriorityName={getPriorityName}
                    getCategoryName={getCategoryName}
                    getStatusVariant={getStatusVariant}
                    getPriorityVariant={getPriorityVariant}
                    formatDate={formatDate}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
        {tickets.length > 0 && (
          <Card.Footer className="bg-light">
            <Row className="align-items-center">
              <Col>
                <small className="text-muted">
                  {user?.role === 'admin' || user?.role === 'moderator'
                    ? 'Отображаются все заявки в системе'
                    : 'Отображаются заявки, созданные вами или назначенные вам'}
                </small>
              </Col>
            </Row>
          </Card.Footer>
        )}
      </Card>
    </div>
  )
}

export default TicketList
