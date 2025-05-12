// src/pages/LoginPage.jsx
import { useState, useContext, useEffect } from 'react'
import { Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { Formik } from 'formik'
import * as Yup from 'yup'

// Схема валидации формы
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Введите корректный email')
    .required('Email обязателен для заполнения'),
  password: Yup.string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен для заполнения'),
})

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, error: contextError, clearError, isAuthenticated } = useContext(AuthContext)
  const [error, setError] = useState(null)
  const [redirectMessage, setRedirectMessage] = useState('')

  // Если пользователь уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }

    // Проверяем, есть ли redirected=true в поисковых параметрах URL
    const params = new URLSearchParams(location.search)
    if (params.get('redirected') === 'true') {
      setRedirectMessage('Для доступа к этой странице необходимо войти в систему')
    }

    // При размонтировании компонента очищаем ошибки
    return () => {
      if (clearError) clearError()
    }
  }, [isAuthenticated, navigate, location.search, clearError])

  // Используем ошибку из контекста, если она есть
  useEffect(() => {
    if (contextError) {
      setError(contextError)
    }
  }, [contextError])

  // Начальные значения формы
  const initialValues = {
    email: '',
    password: '',
  }

  // Обработка отправки формы
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null)

      // Вызываем функцию входа
      await login(values.email, values.password)

      // После успешного входа проверяем, есть ли сохраненный путь для редиректа
      const redirectPath = localStorage.getItem('redirectAfterLogin')

      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin')
        navigate(redirectPath)
      } else {
        // Иначе перенаправляем на главную
        navigate('/')
      }
    } catch (err) {
      console.error('Ошибка авторизации:', err)
      setError(err.message || 'Произошла ошибка при авторизации')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h4 className="text-center mb-4">Вход в систему</h4>

      {redirectMessage && (
        <Alert variant="info" className="mb-4">
          {redirectMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

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
          isSubmitting,
        }) => (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Введите email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.email && !!errors.email}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Введите пароль"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.password && !!errors.password}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid">
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Вход...
                  </>
                ) : 'Войти'}
              </Button>
            </div>

            <div className="text-center mt-3">
              <small className="text-muted">
                Для демо-версии используйте следующие данные:
              </small>
              <div className="mt-2">
                <small>
                  <b>Администратор:</b> admin@example.com / admin123
                </small>
              </div>
              <div>
                <small>
                  <b>Модератор:</b> moderator@example.com / moderator123
                </small>
              </div>
              <div>
                <small>
                  <b>Пользователь:</b> user@example.com / user123
                </small>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default LoginPage
