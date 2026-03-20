import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (selectedCategory) params.categoryId = selectedCategory;

      const response = await api.get('/books', { params });
      setBooks(response.data.books || []);
      setPagination(response.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    api.get('/books/categories').then(res => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchBooks(1), 300);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>📚 Book Catalog</h1>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', minWidth: '160px' }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.categoryId} value={cat.categoryId}>{cat.category_name}</option>
          ))}
        </select>
      </div>

      <p style={{ color: '#6b7280', marginBottom: '16px' }}>
        {pagination.total} books found
      </p>

      {loading ? <Loading /> : error ? <ErrorMessage message={error} onRetry={() => fetchBooks(pagination.page)} /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {books.length === 0 ? (
              <p style={{ color: '#6b7280', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                No books found matching your criteria.
              </p>
            ) : books.map(book => (
              <Link key={book.bookId} to={`/books/${book.bookId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{ cursor: 'pointer', padding: '16px', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{
                    width: '100%',
                    height: '120px',
                    background: `hsl(${book.bookId * 47 % 360}, 60%, 50%)`,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    marginBottom: '12px'
                  }}>📖</div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', lineHeight: 1.3 }}>{book.title}</h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{book.author_name}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>{book.category_name}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '12px',
                      background: book.available_copies > 0 ? '#dcfce7' : '#fee2e2',
                      color: book.available_copies > 0 ? '#16a34a' : '#dc2626'
                    }}>
                      {book.available_copies > 0 ? `${book.available_copies} avail.` : 'Unavailable'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#f59e0b' }}>
                      {'★'.repeat(Math.round(book.avg_rating))}{'☆'.repeat(5 - Math.round(book.avg_rating))}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button disabled={pagination.page <= 1} onClick={() => fetchBooks(pagination.page - 1)}>← Prev</button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={pagination.page === p ? 'active' : ''} onClick={() => fetchBooks(p)}>{p}</button>
              ))}
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchBooks(pagination.page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookCatalog;
