import React from 'react';
import { Table, Spinner } from 'react-bootstrap';

const statusClass = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled' };

export default function BookingTable({ bookings, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="dark-card h-100 d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" style={{ color: 'var(--clr-teal)' }} />
      </div>
    );
  }

  const active = bookings.filter((b) => b.status !== 'cancelled');

  return (
    <div className="dark-card h-100 d-flex flex-column">
      <div className="card-header-label">Booking Table</div>

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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {active.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.facility?.name || '—'}</td>
                  <td>{b.booking_date}</td>
                  <td>{b.start_time} – {b.end_time}</td>
                  <td>
                    <span className={statusClass[b.status] || ''}>{b.status}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => onEdit(b)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-teal)', fontSize: '1.1rem', marginRight: 10 }}
                      title="Edit"
                    >✎</button>
                    <button
                      onClick={() => onDelete(b.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: '1.1rem' }}
                      title="Cancel"
                    >✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Footer bar — matches screenshot */}
      <div className="table-footer-bar">
        Total Bookings: {active.length}
      </div>
    </div>
  );
}
