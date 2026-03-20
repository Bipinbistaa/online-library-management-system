import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/common/Loading';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, available: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes] = await Promise.all([
          api.get('/books?limit=6')
        ]);
        setFeaturedBooks(booksRes.data.books || []);
        setStats({
          total: booksRes.data.pagination?.total || 0,
          available: booksRes.data.books?.filter(b => b.available_copies > 0).length || 0
        });
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '16px' }}>
          📚 Online Library Management System
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.85, marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
          Discover, borrow, and explore thousands of books from our digital library
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/books" className="btn" style={{ background: 'white', color: '#2563eb', padding: '12px 28px', fontSize: '16px' }}>
            Browse Books
          </Link>
          <Link to="/register" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid white', padding: '12px 28px', fontSize: '16px' }}>
            Get Started
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ background: 'white', padding: '40px 20px', borderBottom: '1px solid #e5e7eb' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center' }}>
            {[
              { label: 'Total Books', value: stats.total, icon: '📖' },
              { label: 'Available Now', value: featuredBooks.filter(b => b.available_copies > 0).length, icon: '✅' },
              { label: 'Categories', value: '4+', icon: '📂' },
              { label: 'Active Members', value: '10+', icon: '👥' }
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>{stat.icon}</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>{stat.value}</div>
                <div style={{ color: '#6b7280' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Books */}
      <div className="container" style={{ padding: '40px 20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Featured Books</h2>
        {loading ? <Loading /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
            {featuredBooks.map(book => (
              <Link key={book.bookId} to={`/books/${book.bookId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '16px' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{
                    width: '100%',
                    height: '140px',
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    marginBottom: '12px'
                  }}>📖</div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', lineHeight: 1.3 }}>{book.title}</h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>{book.author_name}</p>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: book.available_copies > 0 ? '#dcfce7' : '#fee2e2',
                    color: book.available_copies > 0 ? '#16a34a' : '#dc2626'
                  }}>
                    {book.available_copies > 0 ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/books" className="btn btn-primary" style={{ padding: '10px 24px' }}>View All Books</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
