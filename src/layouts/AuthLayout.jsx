import { Outlet, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { Container, Card, Row, Col } from 'react-bootstrap'
import { AuthContext } from '../contexts/AuthContext'
import Loader from '../components/common/Loader'

const AuthLayout = () => {
  const { isAuthenticated, loading } = useContext(AuthContext)

  // Пока проверяем авторизацию, показываем лоадер
  if (loading) {
    return <Loader />
  }

  // Если пользователь уже авторизован, редиректим на главную страницу
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="bg-light min-vw-100 min-vh-100 d-flex align-items-center">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="shadow border-0">
              <Card.Header className="bg-primary text-white text-center py-3">
                <h4 className="mb-0">Платформа заявок</h4>
              </Card.Header>
              <Card.Body className="p-4">
                <Outlet />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default AuthLayout
