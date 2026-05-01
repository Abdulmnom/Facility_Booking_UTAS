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
  const [confirmDelete, setConfirmDelete] = useState(null); // id to delete

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleSubmit = async (form) => {
    try {
      if (editBooking) {
        await updateBooking(editBooking.id, form);
        setEditBooking(null);
        showToast(isOffline ? 'Booking updated (saved locally).' : 'Booking updated successfully.');
      } else {
        await createBooking(form);
        showToast(isOffline ? 'Booking created (saved locally).' : 'Booking created! Confirmation email sent.');
      }
    } catch (err) {
      showToast(err.message);
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
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid rgba(0,196,167,.18)', padding: '24px 0 20px' }}>
        <Container fluid="xl">
          <span style={{ color: 'var(--clr-teal)', textTransform: 'uppercase', letterSpacing: '.14em', fontSize: '.72rem', fontWeight: 700 }}>
            Sample Screens
          </span>
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '2rem', marginTop: 6, marginBottom: 4 }}>
            Project Visuals — Booking Form &amp; Table
          </h1>
          <p style={{ color: 'var(--clr-muted)', fontSize: '.88rem', margin: 0 }}>
            Welcome, <strong style={{ color: '#fff' }}>{user?.name}</strong>. Book a facility using the form below.
          </p>
        </Container>
      </div>

      <Container fluid="xl" style={{ marginTop: 28 }}>
        {toast && <div className="alert-dark-success mb-3">✓ {toast}</div>}
        
        {/* Offline mode indicator */}
        {isOffline && (
          <div className="alert-dark-error mb-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              ⚠️ Offline mode: {pendingSync > 0 ? `${pendingSync} change(s) pending sync.` : 'Changes will be saved locally.'}
            </span>
            {pendingSync > 0 && navigator.onLine && (
              <button 
                onClick={syncPending} 
                className="btn-teal btn" 
                style={{ padding: '4px 12px', fontSize: '0.8rem' }}
              >
                Sync now
              </button>
            )}
          </div>
        )}
        
        {error && !isOffline && <div className="alert-dark-error mb-3">{error}</div>}

        {/* Two-column layout matching screenshot */}
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

      {/* Delete confirmation modal */}
      <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)} centered>
        <Modal.Header style={{ background: 'var(--bg-card)', borderBottom: '1px solid rgba(0,196,167,.18)' }}>
          <Modal.Title style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>Cancel Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-card)', color: 'var(--clr-muted)' }}>
          Are you sure you want to cancel this booking? This cannot be undone.
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-card)', borderTop: '1px solid rgba(0,196,167,.18)' }}>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Keep it</Button>
          <Button className="btn-teal btn" onClick={confirmDeletion}>Yes, cancel booking</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
