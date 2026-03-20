import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    }
    logout();
    toast.info('Logged out successfully');
    navigate('/');
  };

  return (
    <nav style={{
      background: '#1e3a5f',
      color: 'white',
      padding: '0 20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
          📚 Library System
        </Link>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/books" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Books</Link>

          {user ? (
            <>
              <Link to="/my-borrows" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>My Borrows</Link>
              <Link to="/profile" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ color: '#fbbf24', textDecoration: 'none' }}>Admin</Link>
              )}
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                Hi, {user.username}
              </span>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{
                background: '#2563eb',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '4px',
                textDecoration: 'none'
              }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
