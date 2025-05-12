
// src/components/tickets/TicketDetail.jsx - исправленная версия для решения проблемы при перезагрузке
import { useState, useEffect, useContext, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card, Row, Col, Badge, Button, Alert, Form, Modal, ListGroup, Spinner } from 'react-bootstrap'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  FaEdit,
  FaCheckCircle,
  FaReply,
  FaTrash,
  FaUserPlus,
  FaUser,
  FaCalendarAlt,
  FaInfoCircle,
  FaTags,
  FaBuilding,
  FaSpinner,
  FaDownload,
  FaExclamationTriangle
} from 'react-icons/fa'
import { TicketContext } from '../../contexts/TicketContext'
import { AuthContext } from '../../contexts/AuthContext'
import Loader from '../common/Loader'
import { formatFileSize } from '../../utils/helpers'
import ticketService from '../../services/ticketService' // Добавили прямое использование сервиса

const TicketDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { getTicketById, updateTicket, addComment, changeStatus, assignTicket, deleteAttachment } = useContext(TicketContext)
  const { user } = useContext(AuthContext)

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0) // Добавили счетчик повторных попыток
  const [success, setSuccess] = useState(location.state?.success ? location.state.message : null)

  const [comment, setComment] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusComment, setStatusComment] = useState('')

  const [newFile, setNewFile] = useState(null)
  const [fileUploadError, setFileUploadError] = useState(null)
  const [fileUploading, setFileUploading] = useState(false)

  // Добавляем ref для предотвращения повторных загрузок
  const hasLoaded = useRef(false)

  // Нормализация ID для совместимости с MongoDB
  const normalizeId = (obj) => {
    if (!obj) return null
    return obj._id ? { ...obj, id: obj._id } : obj
  }

  // Разрешено ли пользователю редактировать заявку
  const canEdit = user && (
    user.role === 'admin' ||
    user.role === 'moderator' ||
    (ticket && ticket.createdBy &&
      (ticket.createdBy.id === user.id || ticket.createdBy._id === user.id))
  )

  // Разрешено ли пользователю управлять статусом
  const canManageStatus = user && (
    user.role === 'admin' ||
    user.role === 'moderator' ||
    (ticket && ticket.assignedTo &&
      (ticket.assignedTo.id === user.id || ticket.assignedTo._id === user.id))
  )

  // Разрешено ли пользователю назначать исполнителя
  const canAssign = user && (user.role === 'admin' || user.role === 'moderator')

  // Функция для повторной попытки загрузки
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setError(null)
    setLoading(true)
    hasLoaded.current = false
  }

  // Получаем данные заявки при загрузке страницы
  useEffect(() => {
    const loadTicket = async () => {
      // Проверяем, чтобы не загружать повторно, если уже успешно загрузили
      if (hasLoaded.current && ticket) return

      try {
        setLoading(true)
        setError(null)

        console.log('Загрузка заявки с ID:', id)

        // Сначала пробуем через контекст
        let ticketData = null
        try {
          console.log('NULL:', ticketData, id)
          ticketData = await getTicketById(id)
          console.log('Полученные данные заявки через контекст:', ticketData)
        } catch (contextError) {
          console.warn('Ошибка получения через контекст, пробуем напрямую через сервис:', contextError)

          // Если через контекст не получилось, пробуем напрямую через сервис
          ticketData = await ticketService.getTicketById(id)
        }

        console.log('Полученные данные заявки:', ticketData)

        if (!ticketData) {
          throw new Error('Заявка не найдена')
        }

        // Нормализуем данные для совместимости
        const normalizedTicket = normalizeId(ticketData)

        // Нормализуем вложенные объекты
        if (normalizedTicket.createdBy) {
          normalizedTicket.createdBy = normalizeId(normalizedTicket.createdBy)
        }
        if (normalizedTicket.assignedTo) {
          normalizedTicket.assignedTo = normalizeId(normalizedTicket.assignedTo)
        }
        if (normalizedTicket.comments && Array.isArray(normalizedTicket.comments)) {
          normalizedTicket.comments = normalizedTicket.comments.map(comment => {
            const normalized = normalizeId(comment)
            if (normalized.createdBy) {
              normalized.createdBy = normalizeId(normalized.createdBy)
            }
            return normalized
          })
        }
        if (normalizedTicket.statusHistory && Array.isArray(normalizedTicket.statusHistory)) {
          normalizedTicket.statusHistory = normalizedTicket.statusHistory.map(status => {
            const normalized = normalizeId(status)
            if (normalized.changedBy) {
              normalized.changedBy = normalizeId(normalized.changedBy)
            }
            return normalized
          })
        }

        setTicket(normalizedTicket)
        setNewStatus(normalizedTicket.status)
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
  }, [id, getTicketById, retryCount]) // Добавили retryCount в зависимости

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
    if (!newFile) return

    try {
      setFileUploading(true)
      setFileUploadError(null)

      // Создаем FormData для загрузки файла
      const formData = new FormData()
      formData.append('files', newFile)

      // Добавляем текущие данные заявки
      Object.keys(ticket).forEach(key => {
        if (key !== 'attachments' && key !== 'comments' && key !== 'statusHistory') {
          const value = ticket[key]
          if (typeof value === 'object' && value !== null) {
            // Для объектов используем ID или весь объект в JSON
            if (value.id || value._id) {
              formData.append(key, value.id || value._id)
            } else {
              formData.append(key, JSON.stringify(value))
            }
          } else if (value !== undefined && value !== null) {
            formData.append(key, value)
          }
        }
      })

      // Обновляем заявку, добавляя новое вложение
      const updatedTicket = await updateTicket(ticket.id, formData)

      // Нормализуем полученные данные
      const normalizedTicket = normalizeId(updatedTicket)

      setTicket(normalizedTicket)
      setNewFile(null)
      setSuccess('Файл успешно прикреплен')
    } catch (err) {
      console.error('Ошибка загрузки файла:', err)
      setFileUploadError(err.message || 'Ошибка загрузки файла')
    } finally {
      setFileUploading(false)
    }
  }

  const handleDeleteFile = async (file) => {
    if (!file || (!file.id && !file._id)) {
      setError('ID файла не определен')
      return
    }

    try {
      setLoading(true)

      // Получаем ID файла
      const attachmentId = file.id || file._id

      // Вызываем API для удаления вложения
      await deleteAttachment(ticket.id, attachmentId)

      // Обновляем заявку в локальном состоянии
      setTicket(prev => ({
        ...prev,
        attachments: prev.attachments.filter(a =>
          a.id !== attachmentId && a._id !== attachmentId
        )
      }))

      setSuccess('Файл успешно удален')
    } catch (err) {
      console.error('Ошибка удаления файла:', err)
      setError(err.message || 'Ошибка удаления файла')
    } finally {
      setLoading(false)
    }
  }

  // Отправка комментария
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      setSubmitting(true)
      setError(null)

      // Добавляем комментарий
      const newComment = await addComment(ticket.id, comment)

      // Обновляем локальное состояние заявки
      setTicket(prev => {
        // Нормализуем новый комментарий
        const normalizedComment = normalizeId(newComment)
        if (normalizedComment.createdBy) {
          normalizedComment.createdBy = normalizeId(normalizedComment.createdBy)
        }

        return {
          ...prev,
          comments: [...(prev.comments || []), normalizedComment]
        }
      })

      setComment('')
      setSuccess('Комментарий добавлен')
    } catch (err) {
      console.error('Ошибка добавления комментария:', err)
      setError(err.message || 'Ошибка добавления комментария')
    } finally {
      setSubmitting(false)
    }
  }

  // Изменение статуса заявки
  const handleStatusChange = async () => {
    if (!newStatus) return

    try {
      setSubmitting(true)
      setError(null)

      const updatedTicket = await changeStatus(ticket.id, newStatus, statusComment)

      // Нормализуем данные
      const normalizedTicket = normalizeId(updatedTicket)

      // Обновляем заявку в состоянии
      setTicket(normalizedTicket)
      setShowStatusModal(false)
      setStatusComment('')
      setSuccess('Статус заявки изменен')
    } catch (err) {
      console.error('Ошибка изменения статуса:', err)
      setError(err.message || 'Ошибка изменения статуса')
    } finally {
      setSubmitting(false)
    }
  }

  // Назначение исполнителя
  const handleAssignToMe = async () => {
    try {
      setSubmitting(true)
      setError(null)

      const updatedTicket = await assignTicket(ticket.id, user.id)

      // Нормализуем данные
      const normalizedTicket = normalizeId(updatedTicket)
      if (normalizedTicket.assignedTo) {
        normalizedTicket.assignedTo = normalizeId(normalizedTicket.assignedTo)
      }

      setTicket(normalizedTicket)
      setSuccess('Вы назначены исполнителем заявки')
    } catch (err) {
      console.error('Ошибка назначения исполнителя:', err)
      setError(err.message || 'Ошибка назначения исполнителя')
    } finally {
      setSubmitting(false)
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

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: ru })
    } catch (error) {
      console.error('Ошибка форматирования даты:', error)
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <Spinner animation="border" role="status" variant="primary" className="mb-3">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
        <p>Загрузка данных заявки...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading><FaExclamationTriangle className="me-2" /> Ошибка!</Alert.Heading>
        <p>{error}</p>
        <div className="d-flex justify-content-between align-items-center">
          <Button onClick={handleRetry} variant="outline-danger">
            <FaSpinner className="me-2" /> Повторить попытку
          </Button>
          <Button onClick={() => navigate('/tickets')} variant="outline-secondary">
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
        <p>Запрашиваемая заявка не существует, была удалена или у вас нет к ней доступа.</p>
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
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <FaSpinner className="me-1 fa-spin" /> Назначение...
                </>
              ) : (
                <>
                  <FaUserPlus className="me-1" /> Назначить себя
                </>
              )}
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
                    {ticket.category === 'maintenance' && 'Тех. обслуживание'}
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
                  <div>{ticket.assignedTo?.name || 'Не назначен'}</div>
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
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="me-1 fa-spin" /> Обновление...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="me-1" /> Изменить статус
                    </>
                  )}
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
              {!ticket.comments || ticket.comments.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <p>Комментариев пока нет</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {ticket.comments?.map((comment, index) => (
                    <ListGroup.Item key={comment.id || comment._id || index} className="py-3">
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
                    disabled={submitting}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!comment.trim() || submitting}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="me-1 fa-spin" /> Отправка...
                      </>
                    ) : (
                      <>
                        <FaReply className="me-1" /> Отправить
                      </>
                    )}
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

              {!ticket.attachments || ticket.attachments.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <p>Нет прикрепленных файлов</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {ticket.attachments?.map((file, index) => (
                    <ListGroup.Item key={file.id || file._id || index} className="py-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div>{file.name}</div>
                          <small className="text-muted">
                            {formatFileSize(file.size)} • Загружен: {formatDate(file.uploadedAt)}
                          </small>
                        </div>
                        <div>
                          <Button variant="outline-primary" size="sm" className="me-2">
                            <FaDownload className="me-1" /> Скачать
                          </Button>
                          {canEdit && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteFile(file)}
                              disabled={loading}
                            >
                              {loading ? <FaSpinner className="fa-spin" /> : <FaTrash />}
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
                        disabled={fileUploading}
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
                          disabled={fileUploading}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                      <div className="d-flex">
                        <Button
                          variant="primary"
                          className="w-100"
                          disabled={fileUploading}
                          onClick={handleFileUpload}
                        >
                          {fileUploading ? (
                            <>
                              <FaSpinner className="me-1 fa-spin" /> Загрузка...
                            </>
                          ) : (
                            'Прикрепить файл'
                          )}
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
              {!ticket.statusHistory || ticket.statusHistory.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <p>История изменений недоступна</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {ticket.statusHistory?.map((statusItem, index) => (
                    <ListGroup.Item key={statusItem.id || statusItem._id || index} className="py-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-bold">Изменение статуса</div>
                        <small className="text-muted">{formatDate(statusItem.changedAt)}</small>
                      </div>
                      <div>
                        Статус изменен на <Badge bg={getStatusVariant(statusItem.status)}>
                          {getStatusName(statusItem.status)}
                        </Badge> пользователем {statusItem.changedBy?.name || 'Администратор'}
                      </div>
                      {statusItem.comment && (
                        <div className="mt-1 small text-muted">
                          Комментарий: {statusItem.comment}
                        </div>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
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
              <option value="new">Новая</option>
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
            disabled={!newStatus || submitting}
          >
            {submitting ? (
              <>
                <FaSpinner className="me-1 fa-spin" /> Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default TicketDetail
