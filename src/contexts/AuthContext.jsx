// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect } from 'react'
import authService from '../services/authService'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Проверяем сохраненного пользователя при загрузке
  useEffect(() => {
    const checkSavedUser = () => {
      try {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)

          // Проверяем наличие токена
          if (userData && userData.token) {
            setUser(userData)

            // Проверяем валидность токена
            authService.checkSession()
              .then(updatedUser => {
                if (updatedUser) {
                  setUser(prev => ({ ...prev, ...updatedUser }))
                }
              })
              .catch(error => {
                console.error('Ошибка проверки сессии:', error)
                // Если токен недействителен, очищаем данные
                localStorage.removeItem('user')
                setUser(null)
              })
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error)
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSavedUser()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const userData = await authService.login(email, password)

      // Проверяем структуру ответа
      if (!userData || !userData.token) {
        throw new Error('Неверный формат ответа сервера')
      }

      setUser(userData)

      // Сохраняем в localStorage
      localStorage.setItem('user', JSON.stringify(userData))

      // Проверяем, есть ли путь для редиректа после логина
      const redirectPath = localStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin')
        window.location.href = redirectPath
      }

      return userData
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка авторизации'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)

      // Вызываем сервис для выхода (очистка сессии на сервере)
      await authService.logout()
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    } finally {
      // Очищаем локальные данные
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('redirectAfterLogin')
      setLoading(false)

      // Перенаправляем на страницу логина
      window.location.href = '/auth/login'
    }
  }

  const updateUser = (updatedUserData) => {
    try {
      const updatedUser = { ...user, ...updatedUserData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user && !!user.token,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator' || user?.role === 'admin',
    hasPermission: (permission) => {
      if (!user) return false

      // Админ имеет все права
      if (user.role === 'admin') return true

      // Проверяем конкретные права пользователя
      return user.permissions?.includes(permission) || false
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
