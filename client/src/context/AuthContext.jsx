import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/authApi.js';

// Context banao
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // App load pe check karo

  // App start pe check karo — kya user pehle se logged in hai?
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await getMe();
          setUser(data.user);
        } catch {
          // Token invalid hai — clean karo
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  // Login — token + user save karo
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Logout — sab clear karo
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — har jagah useContext(AuthContext) likhne ki zaroorat nahi
export const useAuth = () => useContext(AuthContext);