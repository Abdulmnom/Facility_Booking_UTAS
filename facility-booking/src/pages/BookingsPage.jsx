import React, { useState } from 'react';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import BookingForm from '../components/bookings/BookingForm';
import BookingTable from '../components/bookings/BookingTable';
import useBookings from '../hooks/useBookings';
import useAuth from '../hooks/useAuth';

export default function BookingsPage() {
  const { user } = useAuth();
  const { bookings, loading, error, isOffline, pendingSync, createBooking, updateBooking, deleteBooking, syncPending } = useBookings();
  const [editBooking, setEditBooking] = useState(null);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 4000);
  };

  const handleSubmit = async (form) => {
    if (editBooking) {
      await updateBooking(editBooking.id, form);
      setEditBooking(null);
      showToast(isOffline ? 'Booking updated (saved locally).' : 'Booking updated successfully.');
    } else {
      await createBooking(form);
      showToast(isOffline ? 'Booking saved locally — will sync when online.' : 'Booking created! Confirmation email sent.');
    }
  };

  const handleDelete = (id) => setConfirmDelete(id);

  const confirmDeletion = async () => {
    try {
      await deleteBooking(confirmDelete);
      setConfirmDelete(null);
      showToast(isOffline ? 'Booking cancelled (saved locally).' : 'Booking cancelled.');
    } catch (err) {
      setConfirmDelete(null);
      showToast(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '0 0 40px' }}>

      {/* Page header */}
      <div className="page-header">
        <Container fluid="xl">
          <span className="page-header-eyebrow">My Bookings</span>
          <h1 className="page-header-title">Booking Form &amp; Table</h1>
          <p className="page-header-sub">
            Welcome, <strong style={{ color: '#11cc4f' }}>{user?.name}</strong>. Book a facility using the form below.
          </p>
        </Container>
      </div>

      <Container fluid="xl" style={{ marginTop: 28 }}>

        {/* Toast notifications */}
        {toast && (
          <div className={`mb-3 ${toastType === 'error' ? 'alert-dark-error' : 'alert-dark-success'}`}>
            {toastType === 'success' ? '✓ ' : '⚠ '}{toast}
          </div>
        )}

        {/* Offline banner — yellow, distinct from error red */}
        {isOffline && (
          <div className="offline-banner">
            <span>
              ⚠️ Offline mode
              {pendingSync > 0
                ? ` — ${pendingSync} change${pendingSync > 1 ? 's' : ''} pending sync.`
                : ' — Changes will sync automatically when connection is restored.'}
            </span>
            {pendingSync > 0 && navigator.onLine && (
              <button className="btn-teal btn" style={{ padding: '4px 14px', fontSize: '.8rem', flexShrink: 0 }} onClick={syncPending}>
                Sync now
              </button>
            )}
          </div>
        )}

        {error && !isOffline && <div className="alert-dark-error mb-3">{error}</div>}

        {/* Two-column layout */}
        <Row className="g-4">
          <Col xs={12} lg={5}>
            <BookingForm
              editBooking={editBooking}
              onSubmit={handleSubmit}
              onCancel={() => setEditBooking(null)}
            />
          </Col>
          <Col xs={12} lg={7}>
            <BookingTable
              bookings={bookings}
              loading={loading}
              onEdit={setEditBooking}
              onDelete={handleDelete}
            />
          </Col>
        </Row>
      </Container>

      {/* Delete confirmation modal — dark theme applied via CSS (.modal-content override) */}
      <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel this booking? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="btn-outline-muted btn" onClick={() => setConfirmDelete(null)}>
            Keep it
          </Button>
          <Button className="btn-teal btn" onClick={confirmDeletion}>
            Yes, cancel booking
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
