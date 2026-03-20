import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';

const MyBorrows = () => {
  const { user } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBorrows();
  }, []);

  const fetchBorrows = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/borrows/user/${user.userId}`);
      setBorrows(response.data || []);
    } catch (error) {
      toast.error('Failed to load borrowing history');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId) => {
    if (!window.confirm('Are you sure you want to return this book?')) return;
    setReturningId(borrowId);
    try {
      await api.put(`/borrows/${borrowId}/return`);
      toast.success('Book returned successfully!');
      fetchBorrows();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to return book');
    } finally {
      setReturningId(null);
    }
  };

  const filteredBorrows = borrows.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'active') return b.status === 'active';
    if (filter === 'returned') return b.status === 'returned';
    if (filter === 'overdue') return b.status === 'overdue' || (b.status === 'active' && new Date(b.due_date) < new Date());
    return true;
  });

  const isOverdue = (borrow) => borrow.status === 'overdue' || (borrow.status === 'active' && new Date(borrow.due_date) < new Date());

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>📋 My Borrowing History</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Track all your borrowed books</p>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '0' }}>
        {['all', 'active', 'returned', 'overdue'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
              borderBottom: filter === f ? '2px solid #2563eb' : '2px solid transparent',
              color: filter === f ? '#2563eb' : '#6b7280', fontWeight: filter === f ? '600' : '400',
              textTransform: 'capitalize'
            }}>
            {f} ({f === 'all' ? borrows.length : borrows.filter(b =>
              f === 'overdue' ? isOverdue(b) : b.status === f
            ).length})
          </button>
        ))}
      </div>

      {loading ? <Loading /> : filteredBorrows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📚</p>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>No borrows found</p>
          <Link to="/books" className="btn btn-primary" style={{ marginTop: '12px' }}>Browse Books</Link>
        </div>
      ) : (
        <div>
          {filteredBorrows.map(borrow => {
            const overdue = isOverdue(borrow);
            return (
              <div key={borrow.borrowId} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px' }}>
                <div>
                  <h3 style={{ fontWeight: '600', marginBottom: '6px' }}>
                    <Link to={`/books/${borrow.bookId}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                      {borrow.book_title}
                    </Link>
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>ISBN: {borrow.isbn}</p>
                  <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>
                    Borrowed: {new Date(borrow.borrow_date).toLocaleDateString()}
                  </p>
                  <p style={{ color: overdue ? '#dc2626' : '#6b7280', fontSize: '13px', marginBottom: '4px' }}>
                    Due: {new Date(borrow.due_date).toLocaleDateString()}
                    {overdue && ' ⚠️ OVERDUE'}
                  </p>
                  {borrow.return_date && (
                    <p style={{ color: '#16a34a', fontSize: '13px' }}>
                      Returned: {new Date(borrow.return_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span className={`badge badge-${overdue ? 'overdue' : borrow.status}`}>
                    {overdue ? 'Overdue' : borrow.status}
                  </span>
                  {borrow.status !== 'returned' && (
                    <button className="btn btn-success" onClick={() => handleReturn(borrow.borrowId)}
                      disabled={returningId === borrow.borrowId} style={{ fontSize: '13px' }}>
                      {returningId === borrow.borrowId ? 'Returning...' : '↩ Return'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBorrows;
