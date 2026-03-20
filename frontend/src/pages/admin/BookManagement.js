import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

const BookForm = ({ book, categories, authors, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: book?.title || '',
    authorId: book?.authorId || '',
    categoryId: book?.categoryId || '',
    isbn: book?.isbn || '',
    publication_year: book?.publication_year || '',
    publisher: book?.publisher || '',
    total_copies: book?.total_copies || 1,
    description: book?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (book) {
        await api.put(`/books/${book.bookId}`, form);
        toast.success('Book updated!');
      } else {
        await api.post('/books', form);
        toast.success('Book added!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '600px', maxHeight: '90vh', overflow: 'auto' }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '20px' }}>{book ? 'Edit Book' : 'Add New Book'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Title *</label>
              <input name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Author *</label>
              <select name="authorId" value={form.authorId} onChange={handleChange} required>
                <option value="">Select author</option>
                {authors.map(a => <option key={a.authorId} value={a.authorId}>{a.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.category_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>ISBN *</label>
              <input name="isbn" value={form.isbn} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Total Copies *</label>
              <input type="number" name="total_copies" value={form.total_copies} onChange={handleChange} min="1" required />
            </div>
            <div className="form-group">
              <label>Publication Year</label>
              <input type="number" name="publication_year" value={form.publication_year} onChange={handleChange} min="1000" max={new Date().getFullYear()} />
            </div>
            <div className="form-group">
              <label>Publisher</label>
              <input name="publisher" value={form.publisher} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Book'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchBooks = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await api.get('/books', { params });
      setBooks(res.data.books || []);
      setPagination(res.data.pagination || {});
    } catch (e) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get('/books/categories'),
      api.get('/books/authors')
    ]).then(([catRes, authRes]) => {
      setCategories(catRes.data || []);
      setAuthors(authRes.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchBooks(1); }, [search]);

  const handleDelete = async (bookId, title) => {
    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/books/${bookId}`);
      toast.success('Book deleted');
      fetchBooks(pagination.page);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete book');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>📚 Book Management</h1>
        <button className="btn btn-primary" onClick={() => { setEditBook(null); setShowForm(true); }}>+ Add Book</button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input type="text" placeholder="Search books..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', width: '300px' }} />
      </div>

      {loading ? <Loading /> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>ISBN</th>
                <th>Copies</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.bookId}>
                  <td style={{ fontWeight: '500', maxWidth: '200px' }}>{book.title}</td>
                  <td style={{ fontSize: '13px', color: '#6b7280' }}>{book.author_name}</td>
                  <td style={{ fontSize: '13px' }}>{book.category_name}</td>
                  <td style={{ fontSize: '12px', color: '#9ca3af' }}>{book.isbn}</td>
                  <td>
                    <span style={{ color: book.available_copies > 0 ? '#16a34a' : '#dc2626' }}>
                      {book.available_copies}/{book.total_copies}
                    </span>
                  </td>
                  <td style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(book.avg_rating))} ({Number(book.avg_rating).toFixed(1)})</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary" onClick={() => { setEditBook(book); setShowForm(true); }} style={{ fontSize: '12px', padding: '4px 10px' }}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(book.bookId, book.title)} style={{ fontSize: '12px', padding: '4px 10px' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination.totalPages > 1 && (
            <div className="pagination" style={{ padding: '16px' }}>
              <button disabled={pagination.page <= 1} onClick={() => fetchBooks(pagination.page - 1)}>← Prev</button>
              <span style={{ padding: '6px 12px', color: '#6b7280' }}>Page {pagination.page} of {pagination.totalPages}</span>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchBooks(pagination.page + 1)}>Next →</button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <BookForm
          book={editBook}
          categories={categories}
          authors={authors}
          onSave={() => { setShowForm(false); fetchBooks(pagination.page); }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default BookManagement;
