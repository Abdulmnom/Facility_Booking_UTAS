import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export default function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/bookings');
      setBookings(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = useCallback(async (data) => {
    const res = await api.post('/api/bookings', data);
    setBookings((prev) => [res.data, ...prev]);
    return res.data;
  }, []);

  const updateBooking = useCallback(async (id, data) => {
    const res = await api.put(`/api/bookings/${id}`, data);
    setBookings((prev) => prev.map((b) => (b.id === id ? res.data : b)));
    return res.data;
  }, []);

  const deleteBooking = useCallback(async (id) => {
    await api.delete(`/api/bookings/${id}`);
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { bookings, loading, error, fetchBookings, createBooking, updateBooking, deleteBooking };
}
