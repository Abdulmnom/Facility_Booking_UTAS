import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const STORAGE_KEY = 'fbk_bookings';
const STORAGE_PENDING_KEY = 'fbk_pending_sync';

// Load bookings from localStorage
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save bookings to localStorage
function saveToStorage(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
}

// Load pending operations (for offline sync)
function loadPendingOps() {
  try {
    const stored = localStorage.getItem(STORAGE_PENDING_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save pending operations
function savePendingOps(ops) {
  try {
    localStorage.setItem(STORAGE_PENDING_KEY, JSON.stringify(ops));
  } catch {
    // Ignore storage errors
  }
}

// Generate temporary ID for offline bookings
function generateTempId() {
  return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export default function useBookings() {
  const [bookings, setBookings] = useState(() => loadFromStorage());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSync, setPendingSync] = useState(() => loadPendingOps().length);

  // Fetch bookings from API (with localStorage fallback)
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/bookings');
      setBookings(res.data);
      saveToStorage(res.data);
      setIsOffline(false);
    } catch (err) {
      // Fallback to localStorage on API failure
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

  // Initial load
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Persist to localStorage whenever bookings change
  useEffect(() => {
    saveToStorage(bookings);
  }, [bookings]);

  // Create booking (works offline)
  const createBooking = useCallback(async (data) => {
    try {
      const res = await api.post('/api/bookings', data);
      setBookings((prev) => [res.data, ...prev]);
      setIsOffline(false);
      return res.data;
    } catch (err) {
      // Offline mode: create local booking
      const tempBooking = {
        id: generateTempId(),
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        facility: { name: 'Unknown (offline)' }, // Will be resolved on sync
        _offline: true,
      };
      
      setBookings((prev) => [tempBooking, ...prev]);
      
      // Queue for sync
      const pending = loadPendingOps();
      pending.push({ type: 'create', data });
      savePendingOps(pending);
      setPendingSync(pending.length);
      setIsOffline(true);
      
      return tempBooking;
    }
  }, []);

  // Update booking (works offline)
  const updateBooking = useCallback(async (id, data) => {
    try {
      const res = await api.put(`/api/bookings/${id}`, data);
      setBookings((prev) => prev.map((b) => (b.id === id ? res.data : b)));
      setIsOffline(false);
      return res.data;
    } catch (err) {
      // Offline mode: update locally
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, ...data, updatedAt: new Date().toISOString(), _offline: true }
            : b
        )
      );
      
      // Queue for sync (only if not a temp booking)
      if (!String(id).startsWith('temp_')) {
        const pending = loadPendingOps();
        pending.push({ type: 'update', id, data });
        savePendingOps(pending);
        setPendingSync(pending.length);
      }
      
      setIsOffline(true);
      throw new Error('Changes saved locally. Will sync when online.');
    }
  }, []);

  // Delete/Cancel booking (works offline)
  const deleteBooking = useCallback(async (id) => {
    try {
      await api.delete(`/api/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      setIsOffline(false);
    } catch (err) {
      // Offline mode: mark as cancelled locally
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: 'cancelled', _offline: true } : b
        )
      );
      
      // Queue for sync (only if not a temp booking)
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

  // Sync pending operations when coming back online
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
        }
      } catch {
        failedOps.push(op);
      }
    }

    savePendingOps(failedOps);
    setPendingSync(failedOps.length);
    
    // Refresh bookings after sync
    if (failedOps.length === 0) {
      await fetchBookings();
      setIsOffline(false);
    }
  }, [fetchBookings]);

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (pendingSync > 0) {
        syncPending();
      }
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
