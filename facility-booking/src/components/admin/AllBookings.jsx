import React, { useState, useEffect } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import api from '../../api/axios';

const statusClass = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled' };

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
                <td>{b.start_time}–{b.end_time}</td>
                <td style={{ color: 'var(--clr-muted)' }}>{b.purpose || '—'}</td>
                <td><span className={statusClass[b.status] || ''}>{b.status}</span></td>
                <td>
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
