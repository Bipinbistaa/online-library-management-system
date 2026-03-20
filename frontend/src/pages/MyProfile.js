import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    api.get('/users/profile').then(res => {
      setProfileData(res.data);
      setFormData({ full_name: res.data.full_name || '', phone: res.data.phone || '', address: res.data.address || '', password: '', confirmPassword: '' });
    }).catch(() => toast.error('Failed to load profile'));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const updateData = { full_name: formData.full_name, phone: formData.phone, address: formData.address };
      if (formData.password) updateData.password = formData.password;

      const response = await api.put('/users/profile', updateData);
      updateUser({ ...user, ...response.data.user });
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!profileData) return <div className="container"><div className="loading">Loading profile...</div></div>;

  return (
    <div className="container" style={{ maxWidth: '600px', paddingTop: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>👤 My Profile</h1>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: '#2563eb', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold'
          }}>
            {profileData.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 style={{ fontWeight: 'bold', fontSize: '20px' }}>{profileData.full_name}</h2>
            <p style={{ color: '#6b7280' }}>@{profileData.username}</p>
            <span style={{
              fontSize: '12px', padding: '2px 10px', borderRadius: '12px',
              background: profileData.role === 'admin' ? '#fef3c7' : '#dbeafe',
              color: profileData.role === 'admin' ? '#92400e' : '#1e40af'
            }}>{profileData.role}</span>
          </div>
        </div>
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><span style={{ color: '#6b7280', fontSize: '13px' }}>Email</span><p>{profileData.email}</p></div>
          <div><span style={{ color: '#6b7280', fontSize: '13px' }}>Joined</span><p>{new Date(profileData.registration_date).toLocaleDateString()}</p></div>
          <div><span style={{ color: '#6b7280', fontSize: '13px' }}>Status</span><p style={{ color: profileData.status === 'active' ? '#16a34a' : '#dc2626', textTransform: 'capitalize' }}>{profileData.status}</p></div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '20px' }}>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Optional" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={2} placeholder="Optional" />
          </div>
          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
          <h3 style={{ fontWeight: '600', marginBottom: '16px', color: '#374151' }}>Change Password</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current" />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat new password" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;
