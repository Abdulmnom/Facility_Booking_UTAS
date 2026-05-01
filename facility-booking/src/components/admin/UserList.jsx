import React, { useState, useEffect } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';

export default function UserList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/users')
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="d-flex justify-content-center pt-5"><Spinner animation="border" style={{ color: 'var(--clr-teal)' }} /></div>;

  return (
    <div className="dark-card">
      <div className="card-header-label">User Management</div>
      <div className="table-responsive">
        <Table className="dark-table mb-0">
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th>
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
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="table-footer-bar">Total Users: {users.length}</div>
    </div>
  );
}
