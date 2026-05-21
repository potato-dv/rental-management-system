import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:8000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data.user); 
        } catch (error) {
          console.error("Session expired or invalid token:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false); 
    };

    checkLoggedInUser();
  }, []);

  // LOGIN FUNCTION
  const login = async (email, password) => {
    const res = await axios.post('http://localhost:8000/api/auth/login', { 
      email, 
      password 
    });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // REGISTER FUNCTION
  const registerUser = async (name, email, contactNumber, password) => { 
    const res = await axios.post('http://localhost:8000/api/auth/register', { 
      name, 
      email, 
      contactNumber, 
      password 
    });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    registerUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};