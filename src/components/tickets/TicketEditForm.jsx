import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { TicketContext } from '../../contexts/TicketContext'
import FileUploader from '../common/FileUploader'
import Loader from '../common/Loader'

// Схема валидации формы
const validationSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, 'Название должно содержать минимум 5 символов')
    .max(100, 'Название должно содержать максимум 100 символов')
    .required('Название обязательно для заполнения'),
  description: Yup.string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .required('Описание обязательно для заполнения'),
  category: Yup.string()
    .required('Выберите категорию'),
  priority: Yup.string()
    .required('Выберите приоритет'),
  department: Yup.string()
    .required('Выберите отдел'),
})

const TicketEditForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTicketById, updateTicket } = useContext(TicketContext)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ticket, setTicket] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  // Загрузка данных заявки
  useEffect(() => {
    const loadTicket = async () => {
      try {
        setLoading(true)
        const ticketData = await getTicketById(id)
        setTicket(ticketData)
      } catch (err) {
        setError(err.message || 'Ошибка загрузки заявки')
      } finally {
        setLoading(false)
      }
    }

    loadTicket()
  }, [id, getTicketById])

  // Обработка отправки формы
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Подготавливаем данные для обновления
      const ticketData = {
        ...values,
        // Если есть новый файл, используем его, иначе - оставляем существующий
        attachments: selectedFile
          ? [...(ticket.attachments || []), {
              name: selectedFile.name,
              size: selectedFile.size,
              type: selectedFile.type,
              uploadedAt: new Date().toISOString()
            }]
          : ticket.attachments
      }

      const updatedTicket = await updateTicket(id, ticketData)

      // Перенаправляем на страницу заявки
      navigate(`/tickets/${updatedTicket.id}`, {
        state: { success: true, message: 'Заявка успешно обновлена' }
      })
    } catch (err) {
      setError(err.message || 'Произошла ошибка при обновлении заявки')
    } finally {
      setIsSubmitting(false)
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  if (!ticket) {
    return (
      <Alert variant="danger">
        Заявка не найдена или произошла ошибка при загрузке
      </Alert>
    )
  }

  // Начальные значения формы
  const initialValues = {
    title: ticket.title || '',
    description: ticket.description || '',
    category: ticket.category || 'hardware',
    priority: ticket.priority || 'medium',
    department: ticket.department || 'IT',
  }

  return (
    <Card className="shadow-sm">
      <Card.Header as="h5" className="bg-primary text-white">
        Редактирование заявки
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isValid,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Название заявки</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.title && !!errors.title}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Описание</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.description && !!errors.description}
                  rows={4}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Категория</Form.Label>
                    <Form.Select
                      name="category"
                      value={values.category}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.category && !!errors.category}
                    >
                      <option value="hardware">Оборудование</option>
                      <option value="software">Программное обеспечение</option>
                      <option value="network">Сеть</option>
                      <option value="other">Другое</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.category}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Приоритет</Form.Label>
                    <Form.Select
                      name="priority"
                      value={values.priority}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.priority && !!errors.priority}
                    >
                      <option value="low">Низкий</option>
                      <option value="medium">Средний</option>
                      <option value="high">Высокий</option>
                      <option value="critical">Критический</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.priority}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Отдел</Form.Label>
                    <Form.Select
                      name="department"
                      value={values.department}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.department && !!errors.department}
                    >
                      <option value="IT">IT</option>
                      <option value="HR">Кадры</option>
                      <option value="maintenance">Техническое обслуживание</option>
                      <option value="other">Другое</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.department}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <FileUploader
                  onFileSelect={setSelectedFile}
                  maxSize={150 * 1024 * 1024}
                />
              </Form.Group>

              {/* Отображение текущих прикрепленных файлов */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label>Прикрепленные файлы</Form.Label>
                  <div className="list-group">
                    {ticket.attachments.map((file, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>{file.name}</div>
                        <Button variant="outline-danger" size="sm">Удалить</Button>
                      </div>
                    ))}
                  </div>
                </Form.Group>
              )}

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/tickets/${id}`)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  )
}

export default TicketEditForm
