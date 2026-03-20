import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

const BorrowManagement = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [returningId, setReturningId] = useState(null);

  const fetchBorrows = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/borrows', { params });
      setBorrows(res.data.borrows || []);
      setPagination(res.data.pagination || {});
    } catch (e) {
      toast.error('Failed to load borrows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBorrows(1); }, [statusFilter]);

  const handleReturn = async (borrowId) => {
    setReturningId(borrowId);
    try {
      await api.put(`/borrows/${borrowId}/return`);
      toast.success('Book returned successfully');
      fetchBorrows(pagination.page);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to return book');
    } finally {
      setReturningId(null);
    }
  };

  const isOverdue = (b) => b.status === 'overdue' || (b.status === 'active' && new Date(b.due_date) < new Date());

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>📋 Borrow Management</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { value: '', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'returned', label: 'Returned' },
          { value: 'overdue', label: 'Overdue' }
        ].map(opt => (
          <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
            className={`btn ${statusFilter === opt.value ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '13px' }}>
            {opt.label}
          </button>
        ))}
      </div>

      <p style={{ color: '#6b7280', marginBottom: '16px' }}>{pagination.total} records found</p>

      {loading ? <Loading /> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>User</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {borrows.map(b => {
                const overdue = isOverdue(b);
                return (
                  <tr key={b.borrowId}>
                    <td style={{ fontWeight: '500', maxWidth: '200px', fontSize: '14px' }}>{b.book_title}</td>
                    <td>
                      <div style={{ fontWeight: '500', fontSize: '13px' }}>{b.full_name}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>@{b.username}</div>
                    </td>
                    <td style={{ fontSize: '13px' }}>{new Date(b.borrow_date).toLocaleDateString()}</td>
                    <td style={{ fontSize: '13px', color: overdue ? '#dc2626' : 'inherit' }}>
                      {new Date(b.due_date).toLocaleDateString()}
                      {overdue && ' ⚠️'}
                    </td>
                    <td style={{ fontSize: '13px', color: '#16a34a' }}>
                      {b.return_date ? new Date(b.return_date).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${overdue ? 'overdue' : b.status}`}>
                        {overdue ? 'overdue' : b.status}
                      </span>
                    </td>
                    <td>
                      {b.status !== 'returned' && (
                        <button className="btn btn-success" onClick={() => handleReturn(b.borrowId)}
                          disabled={returningId === b.borrowId} style={{ fontSize: '12px', padding: '4px 10px' }}>
                          {returningId === b.borrowId ? '...' : '↩ Return'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pagination.totalPages > 1 && (
            <div className="pagination" style={{ padding: '16px' }}>
              <button disabled={pagination.page <= 1} onClick={() => fetchBorrows(pagination.page - 1)}>← Prev</button>
              <span style={{ padding: '6px 12px', color: '#6b7280' }}>Page {pagination.page} of {pagination.totalPages}</span>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchBorrows(pagination.page + 1)}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BorrowManagement;
