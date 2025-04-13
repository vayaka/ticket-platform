import { Outlet, Navigate } from 'react-router-dom'
import { useContext, useState } from 'react'
import { Container } from 'react-bootstrap'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import { AuthContext } from '../contexts/AuthContext'
import Loader from '../components/common/Loader'

const MainLayout = () => {
  const { isAuthenticated, loading } = useContext(AuthContext)
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  )

  // Функция для переключения темной темы
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }
  }

  // Применяем тему при первом рендере
  if (darkMode) {
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
  }

  // Пока проверяем авторизацию, показываем лоадер
  if (loading) {
    return <Loader />
  }

  // Если пользователь не авторизован, редиректим на страницу логина
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  return (
    <div className="d-flex flex-column min-vw-100 min-vh-100">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Container fluid="lg" className="flex-grow-1 py-4">
        <Outlet />
      </Container>
      <Footer />
    </div>
  )
}

export default MainLayout
