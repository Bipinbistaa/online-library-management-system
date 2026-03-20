import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await api.get('/users', { params });
      setUsers(res.data.users || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(1); }, [search]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/users/${user.userId}`, { status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchUsers(pagination.page);
    } catch (e) {
      toast.error('Failed to update user status');
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'member' : 'admin';
    if (!window.confirm(`Change ${user.username}'s role to ${newRole}?`)) return;
    try {
      await api.put(`/users/${user.userId}`, { role: newRole });
      toast.success('User role updated');
      fetchUsers(pagination.page);
    } catch (e) {
      toast.error('Failed to update user role');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>👥 User Management</h1>

      <div style={{ marginBottom: '16px' }}>
        <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', width: '300px' }} />
      </div>

      {loading ? <Loading /> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.userId}>
                  <td>
                    <div style={{ fontWeight: '500' }}>{u.full_name}</div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>@{u.username}</div>
                  </td>
                  <td style={{ fontSize: '13px' }}>{u.email}</td>
                  <td>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: u.role === 'admin' ? '#fef3c7' : '#dbeafe', color: u.role === 'admin' ? '#92400e' : '#1e40af' }}>
                      {u.role}
                    </span>
                  </td>
                  <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                  <td style={{ fontSize: '13px', color: '#6b7280' }}>{new Date(u.registration_date).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className={`btn ${u.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(u)} style={{ fontSize: '12px', padding: '4px 10px' }}>
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-secondary" onClick={() => handleToggleRole(u)} style={{ fontSize: '12px', padding: '4px 10px' }}>
                        Make {u.role === 'admin' ? 'Member' : 'Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination.totalPages > 1 && (
            <div className="pagination" style={{ padding: '16px' }}>
              <button disabled={pagination.page <= 1} onClick={() => fetchUsers(pagination.page - 1)}>← Prev</button>
              <span style={{ padding: '6px 12px', color: '#6b7280' }}>Page {pagination.page} of {pagination.totalPages}</span>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchUsers(pagination.page + 1)}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
