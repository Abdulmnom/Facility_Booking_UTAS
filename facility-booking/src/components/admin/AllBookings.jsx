import React, { useState, useEffect } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import api from '../../api/axios';

const statusClass = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled' };
const statusLabel = { pending: 'pending', confirmed: 'accepted', cancelled: 'cancelled' };

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchAll = () => {
    setLoading(true);
    api.get('/api/admin/bookings')
      .then((r) => setBookings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchAll(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/admin/bookings/${id}/approve`);
      setMessage('Booking accepted.');
      fetchAll();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to approve');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Force-cancel this booking?')) return;
    await api.delete(`/api/admin/bookings/${id}`);
    setMessage('Booking cancelled.'); fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div className="d-flex justify-content-center pt-5"><Spinner animation="border" style={{ color: 'var(--clr-teal)' }} /></div>;

  const active = bookings.filter((b) => b.status !== 'cancelled');

  return (
    <div className="dark-card">
      <div className="card-header-label">All Bookings</div>
      {message && <div className="alert-dark-success mx-3 mt-3">{message}</div>}
      <div className="table-responsive">
        <Table className="dark-table mb-0">
          <thead>
            <tr>
              <th>User</th><th>Facility</th><th>Date</th><th>Time</th><th>Purpose</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{b.user?.name}</div>
                  <div style={{ color: 'var(--clr-muted)', fontSize: '.78rem' }}>{b.user?.email}</div>
                </td>
                <td>{b.facility?.name}</td>
                <td>{b.booking_date}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{b.start_time}–{b.end_time}</td>
                <td style={{ color: 'var(--clr-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.purpose || <span style={{ opacity: 0.4 }}>—</span>}
                </td>
                <td><span className={statusClass[b.status] || ''}>{statusLabel[b.status] || b.status}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {b.status === 'pending' && (
                    <button onClick={() => handleApprove(b.id)}
                      style={{ background:'none',border:'none',cursor:'pointer',color:'#4ade80',fontWeight:600,fontSize:'.85rem',marginRight:8 }}>
                      Accept
                    </button>
                  )}
                  {b.status !== 'cancelled' && (
                    <button onClick={() => handleCancel(b.id)}
                      style={{ background:'none',border:'none',cursor:'pointer',color:'#f87171',fontWeight:600,fontSize:'.85rem' }}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="table-footer-bar">Total Active: {active.length}</div>
    </div>
  );
}
