import React, { useState, useEffect } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import api from '../../api/axios';

const statusClass = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled' };
const statusLabel = { pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled' };

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('success');

  const fetchAll = () => {
    setLoading(true);
    api.get('/api/admin/bookings')
      .then((r) => setBookings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchAll(); }, []);

  const flash = (msg, type = 'success') => {
    setMessage(msg); setMsgType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/admin/bookings/${id}/approve`);
      flash('Booking confirmed.');
      fetchAll();
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to approve', 'error');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Force-cancel this booking?')) return;
    try {
      await api.delete(`/api/admin/bookings/${id}`);
      flash('Booking cancelled.');
      fetchAll();
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to cancel', 'error');
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center pt-5">
      <Spinner animation="border" style={{ color: 'var(--clr-teal)' }} />
    </div>
  );

  const active = bookings.filter((b) => b.status !== 'cancelled');

  return (
    <div className="dark-card">
      <div className="card-header-label">All Bookings</div>

      {message && (
        <div className={`mx-3 mt-3 ${msgType === 'error' ? 'alert-dark-error' : 'alert-dark-success'}`}>
          {message}
        </div>
      )}

      <div className="table-responsive">
        <Table className="dark-table mb-0">
          <thead>
            <tr>
              <th>User</th>
              <th>Facility</th>
              <th>Date</th>
              <th>Time</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--clr-muted)', padding: 32 }}>
                  No bookings found.
                </td>
              </tr>
            ) : bookings.map((b) => (
              <tr key={b.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{b.user?.name || '—'}</div>
                  <div style={{ color: 'var(--clr-muted)', fontSize: '.78rem' }}>{b.user?.email}</div>
                </td>
                <td>{b.facility?.name || '—'}</td>
                <td>{b.booking_date}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{b.start_time}–{b.end_time}</td>
                <td style={{ color: 'var(--clr-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.purpose || <span style={{ opacity: 0.4 }}>—</span>}
                </td>
                <td>
                  <span className={statusClass[b.status] || ''}>
                    {statusLabel[b.status] || b.status}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {b.status === 'pending' && (
                    <button className="btn-tbl btn-tbl-green" onClick={() => handleApprove(b.id)}>
                      ✓ Approve
                    </button>
                  )}
                  {b.status !== 'cancelled' && (
                    <button className="btn-tbl btn-tbl-red" style={{ marginLeft: b.status === 'pending' ? 8 : 0 }} onClick={() => handleCancel(b.id)}>
                      ✕ Cancel
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
