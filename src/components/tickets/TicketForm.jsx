import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { TicketContext } from '../../contexts/TicketContext'

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

  // Начальные значения формы
  const initialValues = {
    title: '',
    description: '',
    category: 'hardware',
    priority: 'medium',
    department: 'IT',
    file: null,
  }

  // Обработка отправки формы
  const handleSubmit = async (values, { resetForm }) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Здесь можно обработать загрузку файла, если необходимо
      const ticketData = {
        ...values,
        file: values.file ? values.file.name : null, // В реальном приложении здесь будет загрузка
      }

      const newTicket = await createTicket(ticketData)
      resetForm()

      // Перенаправляем на страницу созданной заявки или список заявок
      navigate(`/tickets/${newTicket.id}`, {
        state: { success: true, message: 'Заявка успешно создана' }
      })
    } catch (err) {
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
            setFieldValue,
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
                <Form.Label>Прикрепить файлы</Form.Label>
                <Form.Control
                  type="file"
                  name="file"
                  onChange={(e) => {
                    setFieldValue('file', e.currentTarget.files[0])
                  }}
                />
                <Form.Text className="text-muted">
                  Максимальный размер файла: 150 МБ
                </Form.Text>
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
