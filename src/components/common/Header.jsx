import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap'
import { AuthContext } from '../../contexts/AuthContext'
import { FaSun, FaMoon, FaUser, FaSignOutAlt, FaCog, FaBell } from 'react-icons/fa'

const Header = ({ darkMode, toggleDarkMode }) => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <Navbar bg={darkMode ? 'dark' : 'primary'} variant="dark" expand="lg" sticky="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          Платформа заявок
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Главная</Nav.Link>
            <Nav.Link as={Link} to="/tickets/create">Создать заявку</Nav.Link>
            <Nav.Link as={Link} to="/tickets">Мои заявки</Nav.Link>

            {/* Дополнительные пункты меню для модераторов и администраторов */}
            {(user?.role === 'admin' || user?.role === 'moderator') && (
              <>
                <Nav.Link as={Link} to="/dashboard">Панель управления</Nav.Link>
                <Nav.Link as={Link} to="/reports">Отчеты</Nav.Link>
              </>
            )}
          </Nav>

          <Nav>
            {/* Уведомления */}
            <Dropdown align="end" className="me-2">
              <Dropdown.Toggle variant="link" className="nav-link">
                <FaBell size={18} className="text-light" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Header>Уведомления</Dropdown.Header>
                <Dropdown.Item>Новая заявка #123 создана</Dropdown.Item>
                <Dropdown.Item>Заявка #118 обновлена</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/notifications">Просмотреть все</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Переключатель темы */}
            <Button
              variant="link"
              className="nav-link"
              onClick={toggleDarkMode}
              title={darkMode ? 'Включить светлую тему' : 'Включить темную тему'}
            >
              {darkMode ? <FaSun className="text-light" /> : <FaMoon className="text-light" />}
            </Button>

            {/* Профиль пользователя */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" className="nav-link d-flex align-items-center">
                <FaUser className="me-2 text-light" />
                <span className="text-light">{user?.name || 'Пользователь'}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Header>
                  <div className="fw-bold">{user?.name}</div>
                  <small className="text-muted">{user?.email}</small>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/profile">
                  <FaUser className="me-2" /> Профиль
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/settings">
                  <FaCog className="me-2" /> Настройки
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> Выход
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header
