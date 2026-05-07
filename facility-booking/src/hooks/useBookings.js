import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const STORAGE_KEY = 'fbk_bookings';
const STORAGE_PENDING_KEY = 'fbk_pending_sync';

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // Ignore quota errors
  }
}

function loadPendingOps() {
  try {
    const stored = localStorage.getItem(STORAGE_PENDING_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePendingOps(ops) {
  try {
    localStorage.setItem(STORAGE_PENDING_KEY, JSON.stringify(ops));
  } catch {
    // Ignore quota errors
  }
}

function generateTempId() {
  return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export default function useBookings() {
  const [bookings, setBookings] = useState(() => loadFromStorage());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSync, setPendingSync] = useState(() => loadPendingOps().length);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/bookings');
      setBookings(res.data);
      saveToStorage(res.data);
      setIsOffline(false);
    } catch (err) {
      const cached = loadFromStorage();
      if (cached.length > 0) {
        setBookings(cached);
        setIsOffline(true);
        setError('Working in offline mode. Changes will sync when connection is restored.');
      } else {
        setError(err.response?.data?.message || 'Failed to load bookings');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    saveToStorage(bookings);
  }, [bookings]);

  const createBooking = useCallback(async (data) => {
    // Strip the _facilityName helper field before sending to the API
    const { _facilityName, ...apiData } = data;

    try {
      const res = await api.post('/api/bookings', apiData);
      setBookings((prev) => [res.data, ...prev]);
      setIsOffline(false);
      return res.data;
    } catch (err) {
      // Only go offline when it's a real network/server failure, not a 4xx validation error
      const status = err.response?.status;
      if (status && status < 500) {
        // Propagate validation / conflict errors to the form — don't queue them
        throw err;
      }

      // Network error or 5xx — create local copy and queue for sync
      const tempBooking = {
        id: generateTempId(),
        ...apiData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Use the facility name passed from the form so the table shows the right name
        facility: { name: _facilityName || 'Unknown (offline)' },
        _offline: true,
      };

      setBookings((prev) => [tempBooking, ...prev]);

      // Queue for sync — facility_id is already an integer (coerced in BookingForm)
      const pending = loadPendingOps();
      pending.push({ type: 'create', data: { ...apiData, facility_id: parseInt(apiData.facility_id, 10) } });
      savePendingOps(pending);
      setPendingSync(pending.length);
      setIsOffline(true);

      return tempBooking;
    }
  }, []);

  const updateBooking = useCallback(async (id, data) => {
    const { _facilityName, ...apiData } = data;

    try {
      const res = await api.put(`/api/bookings/${id}`, apiData);
      setBookings((prev) => prev.map((b) => (b.id === id ? res.data : b)));
      setIsOffline(false);
      return res.data;
    } catch (err) {
      const status = err.response?.status;
      if (status && status < 500) throw err;

      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, ...apiData, updatedAt: new Date().toISOString(), _offline: true }
            : b
        )
      );

      if (!String(id).startsWith('temp_')) {
        const pending = loadPendingOps();
        pending.push({
          type: 'update',
          id,
          data: { ...apiData, ...(apiData.facility_id ? { facility_id: parseInt(apiData.facility_id, 10) } : {}) },
        });
        savePendingOps(pending);
        setPendingSync(pending.length);
      }

      setIsOffline(true);
      throw new Error('Changes saved locally. Will sync when online.');
    }
  }, []);

  const deleteBooking = useCallback(async (id) => {
    try {
      await api.delete(`/api/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      setIsOffline(false);
    } catch (err) {
      const status = err.response?.status;
      if (status && status < 500) throw err;

      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: 'cancelled', _offline: true } : b
        )
      );

      if (!String(id).startsWith('temp_')) {
        const pending = loadPendingOps();
        pending.push({ type: 'delete', id });
        savePendingOps(pending);
        setPendingSync(pending.length);
      }

      setIsOffline(true);
      throw new Error('Cancellation saved locally. Will sync when online.');
    }
  }, []);

  const syncPending = useCallback(async () => {
    const pending = loadPendingOps();
    if (pending.length === 0) return;

    const failedOps = [];

    for (const op of pending) {
      try {
        switch (op.type) {
          case 'create':
            await api.post('/api/bookings', op.data);
            break;
          case 'update':
            await api.put(`/api/bookings/${op.id}`, op.data);
            break;
          case 'delete':
            await api.delete(`/api/bookings/${op.id}`);
            break;
          default:
            break;
        }
      } catch (err) {
        const status = err.response?.status;
        // 4xx errors (409 conflict, 404 not found, 400 validation) are permanent failures —
        // discard them instead of retrying forever. Only keep network/5xx errors for retry.
        if (!status || status >= 500) {
          failedOps.push(op);
        }
        // 4xx: silently drop — the operation is no longer valid
      }
    }

    savePendingOps(failedOps);
    setPendingSync(failedOps.length);

    if (failedOps.length === 0) {
      await fetchBookings();
      setIsOffline(false);
    }
  }, [fetchBookings]);

  // Auto-sync when the browser comes back online
  useEffect(() => {
    const handleOnline = () => {
      if (pendingSync > 0) syncPending();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [pendingSync, syncPending]);

  return {
    bookings,
    loading,
    error,
    isOffline,
    pendingSync,
    fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    syncPending,
  };
}
