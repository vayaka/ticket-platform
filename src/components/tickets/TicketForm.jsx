// src/components/tickets/TicketForm.jsx
import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { TicketContext } from '../../contexts/TicketContext'
import FileUploader from '../common/FileUploader'

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

const TicketForm = () => {
  const navigate = useNavigate()
  const { createTicket } = useContext(TicketContext)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  // Начальные значения формы
  const initialValues = {
    title: '',
    description: '',
    category: 'hardware',
    priority: 'medium',
    department: 'IT',
  }

  // Обработка отправки формы
  const handleSubmit = async (values, { resetForm }) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Подготавливаем данные заявки
      const ticketData = {
        ...values,
        attachments: selectedFile ? [selectedFile] : []
      }

      console.log('Отправляем заявку:', ticketData)

      const newTicket = await createTicket(ticketData)
      console.log('Получен ответ:', newTicket)

      resetForm()
      setSelectedFile(null)

      // Проверяем наличие ID в ответе (MongoDB может вернуть _id)
      const ticketId = newTicket.id || newTicket._id

      if (ticketId) {
        // Перенаправляем на страницу созданной заявки
        navigate(`/tickets/${ticketId}`, {
          state: { success: true, message: 'Заявка успешно создана' }
        })
      } else {
        // Если ID нет, перенаправляем на список заявок
        setError('Заявка создана, но не удалось получить ее ID')
        navigate('/tickets', {
          state: { success: true, message: 'Заявка успешно создана' }
        })
      }
    } catch (err) {
      console.error('Ошибка создания заявки:', err)
      setError(err.message || 'Произошла ошибка при создании заявки')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-sm">
      <Card.Header as="h5" className="bg-primary text-white">
        Создание новой заявки
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
                  placeholder="Например, Поломка принтера"
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
                  placeholder="Опишите проблему подробно..."
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
                      <option value="maintenance">Техническое обслуживание</option>
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

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/tickets')}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? 'Создание...' : 'Создать заявку'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  )
}

export default TicketForm
