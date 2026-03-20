import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      background: '#1e3a5f',
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
      padding: '20px',
      marginTop: 'auto'
    }}>
      <p>© {new Date().getFullYear()} Online Library Management System. All rights reserved.</p>
      <p style={{ fontSize: '13px', marginTop: '4px' }}>Built with React & Node.js</p>
    </footer>
  );
};

export default Footer;
