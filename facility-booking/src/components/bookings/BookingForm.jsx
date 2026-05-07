import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import api from '../../api/axios';

// Module-level cache so the facilities list is only fetched once per session
let cachedFacilities = null;

// Parse "HH:MM" (or "H:MM") to total minutes for reliable time comparison
function toMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export default function BookingForm({ editBooking, onSubmit, onCancel }) {
  const [facilities, setFacilities] = useState(cachedFacilities || []);
  const [form, setForm] = useState({ facility_id: '', booking_date: '', start_time: '', end_time: '', purpose: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cachedFacilities) return; // already loaded
    api.get('/api/facilities')
      .then((r) => {
        cachedFacilities = r.data;
        setFacilities(r.data);
      })
      .catch(() => setError('Could not load facilities. Please refresh.'));
  }, []);

  useEffect(() => {
    if (editBooking) {
      setForm({
        facility_id: editBooking.facility_id,
        booking_date: editBooking.booking_date,
        start_time: editBooking.start_time,
        end_time: editBooking.end_time,
        purpose: editBooking.purpose || '',
      });
    } else {
      setForm({ facility_id: '', booking_date: '', start_time: '', end_time: '', purpose: '' });
    }
  }, [editBooking]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.facility_id || !form.booking_date || !form.start_time || !form.end_time) {
      setError('All fields except Purpose are required.');
      return;
    }
    if (toMinutes(form.start_time) >= toMinutes(form.end_time)) {
      setError('End time must be after start time.');
      return;
    }
    setLoading(true);
    try {
      // Check slot availability before submitting
      const params = new URLSearchParams({
        facilityId: form.facility_id,
        date: form.booking_date,
        start: form.start_time,
        end: form.end_time,
        ...(editBooking ? { exclude_id: editBooking.id } : {}),
      });
      const { data: avail } = await api.get(`/api/bookings/availability?${params}`);
      if (!avail.available) {
        setError('This time slot is already booked. Please choose another.');
        setLoading(false);
        return;
      }
      // Coerce facility_id to integer — <select> values are always strings.
      // Pass _facilityName so the offline temp booking can show the real name.
      const selectedFacility = facilities.find((f) => String(f.id) === String(form.facility_id));
      await onSubmit({
        ...form,
        facility_id: parseInt(form.facility_id, 10),
        _facilityName: selectedFacility?.name,
      });
      if (!editBooking) setForm({ facility_id: '', booking_date: '', start_time: '', end_time: '', purpose: '' });
    } catch (err) {
      const data = err.response?.data;
      const fieldError = data?.errors?.[0]?.msg || data?.errors?.[0]?.message;
      setError(fieldError || data?.message || err.message || 'Failed to save booking.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="dark-card h-100">
      <div className="card-header-label">
        {editBooking ? '✏  Edit Booking' : 'Booking Form'}
      </div>
      <div style={{ padding: 24 }}>
        {error && <div className="alert-dark-error mb-3">{error}</div>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Select Facility</Form.Label>
            <Form.Select name="facility_id" value={form.facility_id}
              onChange={handleChange} required className="dark-input">
              <option value="">— choose a facility —</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}  ({f.type}, cap: {f.capacity})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Select Date</Form.Label>
            <Form.Control
              type="date" name="booking_date" value={form.booking_date}
              onChange={handleChange} min={today} required
              className="dark-input" style={{ colorScheme: 'dark' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Select Time (Start)</Form.Label>
            <Form.Control
              type="time" name="start_time" value={form.start_time}
              onChange={handleChange} required
              className="dark-input" style={{ colorScheme: 'dark' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Select Time (End)</Form.Label>
            <Form.Control
              type="time" name="end_time" value={form.end_time}
              onChange={handleChange} required
              className="dark-input" style={{ colorScheme: 'dark' }}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Purpose <span style={{ color: 'var(--clr-muted)' }}>(optional)</span></Form.Label>
            <Form.Control
              type="text" name="purpose" value={form.purpose}
              onChange={handleChange} placeholder="e.g. Study group, Lab session…"
              className="dark-input"
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button type="submit" className="btn-teal btn flex-fill py-2" disabled={loading}>
              {loading
                ? <Spinner size="sm" animation="border" />
                : (editBooking ? '+ Update Booking' : '+ Add Booking')}
            </Button>
            {editBooking && (
              <Button type="button" className="btn-outline-muted btn flex-fill py-2" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
