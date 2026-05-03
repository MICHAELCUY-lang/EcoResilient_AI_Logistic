import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check persisted session
    const saved = localStorage.getItem('eco_user')
    if (saved) {
      setUser(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Simulate auth — accept any credentials
    const userData = {
      id: 'USR-001',
      name: 'Arif Pratama',
      email: email || 'arif@blibli.com',
      role: 'Logistics Manager',
      avatar: null,
    }
    setUser(userData)
    localStorage.setItem('eco_user', JSON.stringify(userData))
    return userData
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('eco_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
