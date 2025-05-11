import { useState, useEffect, useContext, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card, Row, Col, Badge, Button, Alert, Form, Modal, ListGroup } from 'react-bootstrap'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { FaEdit, FaCheckCircle, FaReply, FaTrash, FaUserPlus, FaUser, FaCalendarAlt, FaInfoCircle, FaTags, FaBuilding } from 'react-icons/fa'
import { TicketContext } from '../../contexts/TicketContext'
import { AuthContext } from '../../contexts/AuthContext'
import Loader from '../common/Loader'
import { formatFileSize } from '../../utils/helpers';

const TicketDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { getTicketById, updateTicket, addComment, changeStatus, assignTicket } = useContext(TicketContext);
  const { user } = useContext(AuthContext);

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(location.state?.success ? location.state.message : null)

  const [comment, setComment] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusComment, setStatusComment] = useState('')

  const [newFile, setNewFile] = useState(null);
  const [fileUploadError, setFileUploadError] = useState(null);

  // Добавляем ref для предотвращения повторных загрузок
  const hasLoaded = useRef(false)

  // Разрешено ли пользователю редактировать заявку
  const canEdit = user && (
    user.role === 'admin' ||
    user.role === 'moderator' ||
    (ticket && ticket.createdBy && ticket.createdBy.id === user.id)
  )

  // Разрешено ли пользователю управлять статусом
  const canManageStatus = user && (
    user.role === 'admin' ||
    user.role === 'moderator' ||
    (ticket && ticket.assignedTo && ticket.assignedTo.id === user.id)
  )

  // Разрешено ли пользователю назначать исполнителя
  const canAssign = user && (user.role === 'admin' || user.role === 'moderator')

  // Получаем данные заявки при загрузке страницы
  useEffect(() => {
    const loadTicket = async () => {
      // Проверяем, чтобы не загружать повторно
      if (hasLoaded.current) return

      try {
        setLoading(true)
        setError(null)

        console.log('Загрузка заявки с ID:', id)

        const ticketData = await getTicketById(id)
        console.log('Полученные данные заявки:', ticketData)

        if (!ticketData) {
          throw new Error('Заявка не найдена')
        }

        setTicket(ticketData)
        hasLoaded.current = true
      } catch (err) {
        console.error('Ошибка загрузки заявки:', err)
        setError(err.message || 'Ошибка загрузки заявки')
      } finally {
        setLoading(false)
      }
    }

    loadTicket()

    // Cleanup при размонтировании или изменении ID
    return () => {
      hasLoaded.current = false
    }
  }, [id])

  // Очищаем сообщение об успехе при покидании страницы
  useEffect(() => {
    const timer = setTimeout(() => {
      if (success) {
        setSuccess(null)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [success])

  // Метод для добавления файла
  const handleFileUpload = async () => {
    if (!newFile) return;

    try {
      setLoading(true);
      setFileUploadError(null);

      // В реальном приложении здесь будет загрузка файла на сервер
      const fileData = {
        name: newFile.name,
        size: newFile.size,
        type: newFile.type,
        uploadedAt: new Date().toISOString()
      };

      // Добавляем файл к заявке
      const updatedTicket = await updateTicket(ticket.id, {
        ...ticket,
        attachments: [...(ticket.attachments || []), fileData]
      });

      setTicket(updatedTicket);
      setNewFile(null);
      setSuccess('Файл успешно прикреплен');
    } catch (err) {
      setFileUploadError(err.message || 'Ошибка загрузки файла');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (file) => {
    try {
      setLoading(true);

      // Создаем новый массив вложений без удаляемого файла
      const updatedAttachments = ticket.attachments.filter(
        attachment => attachment.name !== file.name || attachment.uploadedAt !== file.uploadedAt
      );

      // Обновляем заявку
      const updatedTicket = await updateTicket(ticket.id, {
        ...ticket,
        attachments: updatedAttachments
      });

      setTicket(updatedTicket);
      setSuccess('Файл успешно удален');
    } catch (err) {
      setError(err.message || 'Ошибка удаления файла');
    } finally {
      setLoading(false);
    }
  };

  // Отправка комментария
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      setLoading(true)
      setError(null)

      // Добавляем комментарий
      const newComment = await addComment(ticket.id, comment)

      // Обновляем локальное состояние заявки
      setTicket(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }))

      setComment('')
      setSuccess('Комментарий добавлен')
    } catch (err) {
      setError(err.message || 'Ошибка добавления комментария')
    } finally {
      setLoading(false)
    }
  }

  // Изменение статуса заявки
  const handleStatusChange = async () => {
    if (!newStatus) return

    try {
      setLoading(true)

      const updatedTicket = await changeStatus(ticket.id, newStatus, statusComment)

      setTicket(updatedTicket)
      setShowStatusModal(false)
      setNewStatus('')
      setStatusComment('')
      setSuccess('Статус заявки изменен')
    } catch (err) {
      setError(err.message || 'Ошибка изменения статуса')
    } finally {
      setLoading(false)
    }
  }

  // Назначение исполнителя
  const handleAssignToMe = async () => {
    try {
      setLoading(true)

      const updatedTicket = await assignTicket(ticket.id, user.id, user.name)

      setTicket(updatedTicket)
      setSuccess('Вы назначены исполнителем заявки')
    } catch (err) {
      setError(err.message || 'Ошибка назначения исполнителя')
    } finally {
      setLoading(false)
    }
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

  // Локализация статусов
  const getStatusName = (status) => {
    switch (status) {
      case 'new':
        return 'Назначена'
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

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return format(date, 'dd MMMM yyyy, HH:mm', { locale: ru })
  }

  if (loading && !ticket) {
    return <Loader />
  }

  if (error && !ticket) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Ошибка!</Alert.Heading>
        <p>{error}</p>
        <div className="d-flex justify-content-end">
          <Button onClick={() => navigate('/tickets')} variant="outline-danger">
            Вернуться к списку
          </Button>
        </div>
      </Alert>
    )
  }

  if (!ticket) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Заявка не найдена</Alert.Heading>
        <p>Запрашиваемая заявка не существует или была удалена.</p>
        <div className="d-flex justify-content-end">
          <Button onClick={() => navigate('/tickets')} variant="outline-warning">
            Вернуться к списку
          </Button>
        </div>
      </Alert>
    )
  }

  return (
    <div>
      {success && (
        <Alert
          variant="success"
          onClose={() => setSuccess(null)}
          dismissible
          className="mb-4"
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          onClose={() => setError(null)}
          dismissible
          className="mb-4"
        >
          {error}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Заявка #{ticket.id || ticket._id}</h2>
        <div>
          <Button
            variant="outline-secondary"
            className="me-2"
            onClick={() => navigate('/tickets')}
          >
            Назад к списку
          </Button>

          {canEdit && (
            <Button
              variant="outline-primary"
              className="me-2"
              onClick={() => navigate(`/tickets/${ticket.id || ticket._id}/edit`)}
            >
              <FaEdit className="me-1" /> Редактировать
            </Button>
          )}

          {canAssign && !ticket.assignedTo && (
            <Button
              variant="primary"
              onClick={handleAssignToMe}
              disabled={loading}
            >
              <FaUserPlus className="me-1" /> Назначить себя
            </Button>
          )}
        </div>
      </div>

      <Row>
        <Col lg={8}>
          {/* Основная информация о заявке */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaInfoCircle className="me-2" /> Основная информация
              </h5>
              <div>
                <Badge bg={getStatusVariant(ticket.status)} className="me-1">
                  {getStatusName(ticket.status)}
                </Badge>
                <Badge bg={getPriorityVariant(ticket.priority)}>
                  {getPriorityName(ticket.priority)}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <h4 className="mb-3">{ticket.title}</h4>
              <p className="text-muted mb-4">
                <small>
                  Создана: {formatDate(ticket.createdAt)} |
                  Автор: {ticket.createdBy?.name || 'Администратор'}
                </small>
              </p>
              <div className="mb-4">{ticket.description}</div>

              <Row className="g-3 mt-2">
                <Col sm={6} md={3}>
                  <div className="d-flex align-items-center mb-2">
                    <FaTags className="text-muted me-2" />
                    <span className="fw-bold small">Категория:</span>
                  </div>
                  <div>
                    {ticket.category === 'hardware' && 'Оборудование'}
                    {ticket.category === 'software' && 'Программное обеспечение'}
                    {ticket.category === 'network' && 'Сеть'}
                    {ticket.category === 'other' && 'Другое'}
                  </div>
                </Col>

                <Col sm={6} md={3}>
                  <div className="d-flex align-items-center mb-2">
                    <FaBuilding className="text-muted me-2" />
                    <span className="fw-bold small">Отдел:</span>
                  </div>
                  <div>{ticket.department || 'IT'}</div>
                </Col>

                <Col sm={6} md={3}>
                  <div className="d-flex align-items-center mb-2">
                    <FaUser className="text-muted me-2" />
                    <span className="fw-bold small">Исполнитель:</span>
                  </div>
                  <div>{ticket.assignedTo?.name || 'Администратор'}</div>
                </Col>

                <Col sm={6} md={3}>
                  <div className="d-flex align-items-center mb-2">
                    <FaCalendarAlt className="text-muted me-2" />
                    <span className="fw-bold small">Дедлайн:</span>
                  </div>
                  <div className={ticket.dueDate ? 'text-danger' : ''}>
                    {formatDate(ticket.dueDate)}
                  </div>
                </Col>
              </Row>
            </Card.Body>
            {canManageStatus && (
              <Card.Footer className="bg-white">
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    setNewStatus(ticket.status)
                    setShowStatusModal(true)
                  }}
                >
                  <FaCheckCircle className="me-1" /> Изменить статус
                </Button>
              </Card.Footer>
            )}
          </Card>

          {/* Комментарии к заявке */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Комментарии ({ticket.comments?.length || 0})</h5>
            </Card.Header>
            <Card.Body>
              {ticket.comments?.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p>Комментариев пока нет</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {ticket.comments?.map((comment, index) => (
                    <ListGroup.Item key={comment.id || index} className="py-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-bold">
                          {comment.createdBy?.name || 'Администратор'}
                        </div>
                        <small className="text-muted">
                          {formatDate(comment.createdAt)}
                        </small>
                      </div>
                      <div>{comment.text}</div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
            <Card.Footer className="bg-white">
              <Form onSubmit={handleCommentSubmit}>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Введите комментарий..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!comment.trim() || loading}
                  >
                    <FaReply className="me-1" /> Отправить
                  </Button>
                </div>
              </Form>
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Файлы */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Прикрепленные файлы</h5>
            </Card.Header>
            <Card.Body>
              {fileUploadError && (
                <Alert variant="danger" onClose={() => setFileUploadError(null)} dismissible>
                  {fileUploadError}
                </Alert>
              )}

              {ticket.attachments?.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p>Нет прикрепленных файлов</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {ticket.attachments?.map((file, index) => (
                    <ListGroup.Item key={index} className="py-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div>{file.name}</div>
                          <small className="text-muted">
                            {formatFileSize(file.size)} • Загружен: {formatDate(file.uploadedAt)}
                          </small>
                        </div>
                        <div>
                          <Button variant="outline-primary" size="sm" className="me-2">
                            Скачать
                          </Button>
                          {canEdit && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteFile(file)}
                            >
                              Удалить
                            </Button>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
            <Card.Footer className="bg-white">
              {canEdit && (
                <>
                  {!newFile ? (
                    <Form.Group>
                      <Form.Label>Прикрепить файл</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={(e) => setNewFile(e.target.files[0])}
                      />
                      <Form.Text className="text-muted">
                        Максимальный размер файла: 150 МБ
                      </Form.Text>
                    </Form.Group>
                  ) : (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="text-truncate">{newFile.name}</div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setNewFile(null)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                      <div className="d-flex">
                        <Button
                          variant="primary"
                          className="w-100"
                          disabled={loading}
                          onClick={handleFileUpload}
                        >
                          {loading ? 'Загрузка...' : 'Прикрепить файл'}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card.Footer>
          </Card>

          {/* История изменений */}
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">История изменений</h5>
            </Card.Header>
            <Card.Body>
              {/* В демо-версии просто статичный текст */}
              <ListGroup variant="flush">
                <ListGroup.Item className="py-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="fw-bold">Изменение статуса</div>
                    <small className="text-muted">{formatDate(ticket.updatedAt)}</small>
                  </div>
                  <div>
                    Статус изменен на <Badge bg={getStatusVariant(ticket.status)}>
                      {getStatusName(ticket.status)}
                    </Badge>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="py-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="fw-bold">Создание заявки</div>
                    <small className="text-muted">{formatDate(ticket.createdAt)}</small>
                  </div>
                  <div>Заявка создана пользователем {ticket.createdBy?.name || 'Администратор'}</div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Модальное окно изменения статуса */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Изменение статуса заявки</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Новый статус</Form.Label>
            <Form.Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">Выберите статус</option>
              <option value="new">Назначена</option>
              <option value="assigned">Назначена</option>
              <option value="in-progress">В работе</option>
              <option value="completed">Выполнена</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Комментарий к изменению статуса</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Добавьте комментарий (опционально)..."
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleStatusChange}
            disabled={!newStatus || loading}
          >
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default TicketDetail
