import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore auth state from localStorage
    const savedToken = localStorage.getItem('osn_token');
    const savedUser = localStorage.getItem('osn_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('osn_token');
        localStorage.removeItem('osn_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (authResponse) => {
    const { token: newToken, ...userData } = authResponse;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('osn_token', newToken);
    localStorage.setItem('osn_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('osn_token');
    localStorage.removeItem('osn_user');
  };

  const isAdmin = user?.role === 'Admin';
  const isPendaftar = user?.role === 'Pendaftar';
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isPendaftar,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
