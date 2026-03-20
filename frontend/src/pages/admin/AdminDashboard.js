import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><Loading /></div>;

  const stats = data?.stats || {};
  const statCards = [
    { label: 'Total Members', value: stats.totalUsers, icon: '👥', color: '#dbeafe', textColor: '#1e40af', link: '/admin/users' },
    { label: 'Total Books', value: stats.totalBooks, icon: '📚', color: '#dcfce7', textColor: '#166534', link: '/admin/books' },
    { label: 'Active Borrows', value: stats.activeBorrows, icon: '📋', color: '#fef9c3', textColor: '#854d0e', link: '/admin/borrows' },
    { label: 'Overdue Books', value: stats.overdueBorrows, icon: '⚠️', color: '#fee2e2', textColor: '#991b1b', link: '/admin/borrows' },
    { label: 'Total Reviews', value: stats.totalReviews, icon: '⭐', color: '#fef3c7', textColor: '#92400e', link: '/admin/books' },
    { label: 'Available Books', value: stats.availableBooks, icon: '✅', color: '#d1fae5', textColor: '#065f46', link: '/admin/books' }
  ];

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>🛡️ Admin Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Library system overview and statistics</p>

      {/* Admin Navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {[
          { to: '/admin/users', label: '👥 Users' },
          { to: '/admin/books', label: '📚 Books' },
          { to: '/admin/borrows', label: '📋 Borrows' }
        ].map(item => (
          <Link key={item.to} to={item.to} className="btn btn-secondary">{item.label}</Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {statCards.map((card, i) => (
          <Link key={i} to={card.link} style={{ textDecoration: 'none' }}>
            <div style={{ background: card.color, borderRadius: '8px', padding: '20px', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: card.textColor }}>{card.value ?? '-'}</div>
              <div style={{ color: card.textColor, fontSize: '13px', opacity: 0.8 }}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Borrows */}
        <div className="card">
          <h2 style={{ fontWeight: '600', marginBottom: '16px' }}>Recent Borrows</h2>
          {(data?.recentBorrows || []).map(b => (
            <div key={b.borrowId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <p style={{ fontWeight: '500', fontSize: '14px' }}>{b.book_title}</p>
                <p style={{ color: '#6b7280', fontSize: '12px' }}>{b.full_name}</p>
              </div>
              <span className={`badge badge-${b.status}`}>{b.status}</span>
            </div>
          ))}
          <Link to="/admin/borrows" style={{ color: '#2563eb', fontSize: '13px', marginTop: '12px', display: 'block' }}>View all →</Link>
        </div>

        {/* Top Books */}
        <div className="card">
          <h2 style={{ fontWeight: '600', marginBottom: '16px' }}>Top Borrowed Books</h2>
          {(data?.topBooks || []).map((book, i) => (
            <div key={book.bookId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '13px', width: '20px' }}>#{i + 1}</span>
                <p style={{ fontWeight: '500', fontSize: '14px' }}>{book.title}</p>
              </div>
              <span style={{ color: '#6b7280', fontSize: '13px' }}>{book.borrow_count} borrows</span>
            </div>
          ))}
          <Link to="/admin/books" style={{ color: '#2563eb', fontSize: '13px', marginTop: '12px', display: 'block' }}>Manage books →</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
