import React from 'react';
import { Table, Spinner } from 'react-bootstrap';

const statusClass = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled' };
const statusLabel = { pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled' };

export default function BookingTable({ bookings, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="dark-card h-100 d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" style={{ color: 'var(--clr-teal)' }} />
      </div>
    );
  }

  const active = bookings.filter((b) => b.status !== 'cancelled');
  const offlineCount = bookings.filter((b) => b._offline).length;

  return (
    <div className="dark-card h-100 d-flex flex-column">
      <div className="card-header-label">
        Booking Table{' '}
        {offlineCount > 0 && (
          <span className="offline-chip">({offlineCount} offline)</span>
        )}
      </div>

      <div className="table-responsive flex-grow-1">
        {active.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--clr-muted)' }}>
            No bookings yet. Use the form to create one.
          </div>
        ) : (
          <Table className="dark-table mb-0">
            <thead>
              <tr>
                <th>Facility</th>
                <th>Date</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {active.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>
                    {b.facility?.name || '—'}
                    {b._offline && (
                      <span className="offline-icon" title="Saved locally — will sync when online">💾</span>
                    )}
                  </td>
                  <td>{b.booking_date}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{b.start_time} – {b.end_time}</td>
                  <td style={{ color: 'var(--clr-muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.purpose || <span style={{ opacity: 0.4 }}>—</span>}
                  </td>
                  <td>
                    <span className={statusClass[b.status] || ''}>
                      {statusLabel[b.status] || b.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      className="btn-tbl-icon btn-tbl-teal"
                      onClick={() => onEdit(b)}
                      title="Edit booking"
                    >✎</button>
                    <button
                      className="btn-tbl-icon btn-tbl-red"
                      onClick={() => onDelete(b.id)}
                      title="Cancel booking"
                    >✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <div className="table-footer-bar">
        Total Bookings: {active.length}
      </div>
    </div>
  );
}
