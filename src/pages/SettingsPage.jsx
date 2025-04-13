import { useState, useContext } from 'react'
import { Card, Row, Col, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap'
import { FaUser, FaBell, FaLock, FaPalette } from 'react-icons/fa'
import { AuthContext } from '../contexts/AuthContext'

const SettingsPage = () => {
  const { user } = useContext(AuthContext)

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    position: '',
    department: user?.department || 'IT'
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newTicketNotification: true,
    statusChangeNotification: true,
    commentNotification: true,
    dueDataReminderNotification: true
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [themeSettings, setThemeSettings] = useState({
    darkMode: localStorage.getItem('darkMode') === 'true',
    colorScheme: 'blue',
    fontSize: 'medium'
  })

  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')

  // Обработчики изменений форм
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotificationSettings(prev => ({ ...prev, [name]: checked }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleThemeChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setThemeSettings(prev => ({ ...prev, [name]: newValue }))

    // Если изменение темы, сохраняем в localStorage
    if (name === 'darkMode') {
      localStorage.setItem('darkMode', newValue)
      // Здесь можно добавить логику применения темы
    }
  }

  // Обработчики отправки форм
  const handleProfileSubmit = (e) => {
    e.preventDefault()
    // Здесь будет логика обновления профиля
    setSuccessMessage('Профиль успешно обновлен')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleNotificationSubmit = (e) => {
    e.preventDefault()
    // Здесь будет логика обновления настроек уведомлений
    setSuccessMessage('Настройки уведомлений сохранены')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    // Здесь будет логика изменения пароля
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Новый пароль и подтверждение не совпадают')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Пароль должен содержать не менее 6 символов')
      return
    }

    setSuccessMessage('Пароль успешно изменен')
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setError('')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleThemeSubmit = (e) => {
    e.preventDefault()
    // Здесь будет логика сохранения настроек темы
    setSuccessMessage('Настройки интерфейса сохранены')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  return (
    <div>
      <h2 className="mb-4">Настройки</h2>

      {successMessage && (
        <Alert
          variant="success"
          onClose={() => setSuccessMessage('')}
          dismissible
          className="mb-4"
        >
          {successMessage}
        </Alert>
      )}

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Tabs
            defaultActiveKey="profile"
            className="mb-4"
          >
            {/* Вкладка профиля */}
            <Tab eventKey="profile" title={<><FaUser className="me-2" /> Профиль</>}>
              <Form onSubmit={handleProfileSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Имя</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Телефон</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder="Введите номер телефона"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Должность</Form.Label>
                      <Form.Control
                        type="text"
                        name="position"
                        value={profileData.position}
                        onChange={handleProfileChange}
                        placeholder="Введите должность"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Отдел</Form.Label>
                  <Form.Select
                    name="department"
                    value={profileData.department}
                    onChange={handleProfileChange}
                  >
                    <option value="IT">IT</option>
                    <option value="HR">Кадры</option>
                    <option value="maintenance">Техническое обслуживание</option>
                    <option value="other">Другое</option>
                  </Form.Select>
                </Form.Group>

                <Button type="submit" variant="primary">
                  Сохранить изменения
                </Button>
              </Form>
            </Tab>

            {/* Вкладка уведомлений */}
            <Tab eventKey="notifications" title={<><FaBell className="me-2" /> Уведомления</>}>
              <Form onSubmit={handleNotificationSubmit}>
                <h5 className="mb-3">Каналы уведомлений</h5>
                <div className="mb-4">
                  <Form.Check
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    label="Email уведомления"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                    className="mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="pushNotifications"
                    name="pushNotifications"
                    label="Push-уведомления в браузере"
                    checked={notificationSettings.pushNotifications}
                    onChange={handleNotificationChange}
                  />
                </div>

                <h5 className="mb-3">Типы уведомлений</h5>
                <div className="mb-4">
                  <Form.Check
                    type="checkbox"
                    id="newTicketNotification"
                    name="newTicketNotification"
                    label="Новая заявка"
                    checked={notificationSettings.newTicketNotification}
                    onChange={handleNotificationChange}
                    className="mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="statusChangeNotification"
                    name="statusChangeNotification"
                    label="Изменение статуса заявки"
                    checked={notificationSettings.statusChangeNotification}
                    onChange={handleNotificationChange}
                    className="mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="commentNotification"
                    name="commentNotification"
                    label="Новый комментарий к заявке"
                    checked={notificationSettings.commentNotification}
                    onChange={handleNotificationChange}
                    className="mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="dueDataReminderNotification"
                    name="dueDataReminderNotification"
                    label="Напоминание о дедлайне"
                    checked={notificationSettings.dueDataReminderNotification}
                    onChange={handleNotificationChange}
                  />
                </div>

                <Button type="submit" variant="primary">
                  Сохранить настройки
                </Button>
              </Form>
            </Tab>

            {/* Вкладка безопасности */}
            <Tab eventKey="security" title={<><FaLock className="me-2" /> Безопасность</>}>
              <Form onSubmit={handlePasswordSubmit}>
                <h5 className="mb-3">Изменение пароля</h5>

                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Текущий пароль</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Новый пароль</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Пароль должен содержать не менее 6 символов
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Подтверждение пароля</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary">
                  Изменить пароль
                </Button>
              </Form>

              <hr className="my-4" />

              <h5 className="mb-3">Сеансы</h5>
              <p>Текущий сеанс: {new Date().toLocaleString()}</p>
              <Button variant="outline-danger">
                Завершить все другие сеансы
              </Button>
            </Tab>

            {/* Вкладка интерфейса */}
            <Tab eventKey="interface" title={<><FaPalette className="me-2" /> Интерфейс</>}>
              <Form onSubmit={handleThemeSubmit}>
                <h5 className="mb-3">Настройки темы</h5>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="darkMode"
                    name="darkMode"
                    label="Темная тема"
                    checked={themeSettings.darkMode}
                    onChange={handleThemeChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Цветовая схема</Form.Label>
                  <Form.Select
                    name="colorScheme"
                    value={themeSettings.colorScheme}
                    onChange={handleThemeChange}
                  >
                    <option value="blue">Синяя (по умолчанию)</option>
                    <option value="green">Зеленая</option>
                    <option value="purple">Фиолетовая</option>
                    <option value="orange">Оранжевая</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Размер шрифта</Form.Label>
                  <Form.Select
                    name="fontSize"
                    value={themeSettings.fontSize}
                    onChange={handleThemeChange}
                  >
                    <option value="small">Маленький</option>
                    <option value="medium">Средний (по умолчанию)</option>
                    <option value="large">Большой</option>
                  </Form.Select>
                </Form.Group>

                <Button type="submit" variant="primary">
                  Сохранить настройки
                </Button>
              </Form>

              <hr className="my-4" />

              <h5 className="mb-3">Настройки отображения</h5>
              <Form.Group className="mb-3">
                <Form.Label>Вид заявок по умолчанию</Form.Label>
                <Form.Select>
                  <option value="table">Таблица</option>
                  <option value="cards">Карточки</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Элементов на странице</Form.Label>
                <Form.Select>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Form.Select>
              </Form.Group>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  )
}

export default SettingsPage
