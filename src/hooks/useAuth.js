import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

/**
 * Хук для доступа к контексту аутентификации
 * @returns {Object} Объект контекста аутентификации
 */
const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }

  return context
}

export default useAuth
