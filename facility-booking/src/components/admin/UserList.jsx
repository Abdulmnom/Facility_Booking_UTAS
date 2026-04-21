import React, { useState, useEffect } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';

export default function UserList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/api/admin/users')
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: res.data.role } : u));
      setMessage(`Role updated to ${newRole}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (loading) return <div className="d-flex justify-content-center pt-5"><Spinner animation="border" style={{ color: 'var(--clr-teal)' }} /></div>;

  return (
    <div className="dark-card">
      <div className="card-header-label">User Management</div>
      {message && <div className="alert-dark-success mx-3 mt-3">{message}</div>}
      <div className="table-responsive">
        <Table className="dark-table mb-0">
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id}>
                <td style={{ color: 'var(--clr-muted)' }}>{i + 1}</td>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td style={{ color: 'var(--clr-muted)' }}>{u.email}</td>
                <td><span className={u.role === 'admin' ? 'badge-admin' : 'badge-user-role'}>{u.role}</span></td>
                <td style={{ color: 'var(--clr-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  {u.id !== currentUser.id ? (
                    <button onClick={() => toggleRole(u.id, u.role)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-teal)', fontSize: '.85rem', fontWeight: 600 }}>
                      {u.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                  ) : (
                    <span style={{ color: 'var(--clr-muted)', fontSize: '.8rem' }}>You</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="table-footer-bar">Total Users: {users.length}</div>
    </div>
  );
}
