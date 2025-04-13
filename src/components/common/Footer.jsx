import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0">
              &copy; {currentYear} Платформа заявок
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <Link to="/help" className="text-light text-decoration-none me-3">
              Справка
            </Link>
            <Link to="/contacts" className="text-light text-decoration-none">
              Контакты администраторов
            </Link>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
