import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TicketProvider } from './contexts/TicketContext'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import TicketsPage from './pages/TicketsPage'
import CreateTicketPage from './pages/CreateTicketPage'
import TicketDetailPage from './pages/TicketDetailPage'

function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <Router>
          <Routes>
            {/* Защищенные маршруты */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="tickets/create" element={<CreateTicketPage />} />
              <Route path="tickets/:id" element={<TicketDetailPage />} />
            </Route>

            {/* Публичные маршруты */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
            </Route>
          </Routes>
        </Router>
      </TicketProvider>
    </AuthProvider>
  )
}

export default App
