import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State for storing all bookings
  const [bookings, setBookings] = useState([]);

  // State for form inputs
  const [facility, setFacility] = useState('Room A');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Error message state
  const [error, setError] = useState('');

  // Load bookings from LocalStorage when page loads
  useEffect(() => {
    const savedBookings = localStorage.getItem('universityBookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }
  }, []);

  // Save bookings to LocalStorage whenever bookings change
  useEffect(() => {
    localStorage.setItem('universityBookings', JSON.stringify(bookings));
  }, [bookings]);

  // Function to add a new booking
  const addBooking = () => {
    // Check if all fields are filled
    if (!facility || !date || !time) {
      setError('Please fill in all fields');
      return;
    }

    // Check for duplicate booking (same facility and time)
    const isDuplicate = bookings.some(
      booking => booking.facility === facility && booking.date === date && booking.time === time
    );

    if (isDuplicate) {
      setError('This booking already exists! Please choose a different time.');
      return;
    }

    // Create new booking object
    const newBooking = {
      id: Date.now(),
      facility: facility,
      date: date,
      time: time
    };

    // Add to bookings array
    setBookings([...bookings, newBooking]);

    // Clear form
    setDate('');
    setTime('');
    setError('');
    setEditingId(null);
  };

  // Function to delete a booking
  const deleteBooking = (id) => {
    const updatedBookings = bookings.filter(booking => booking.id !== id);
    setBookings(updatedBookings);
  };

  // Function to start editing a booking
  const startEdit = (booking) => {
    setFacility(booking.facility);
    setDate(booking.date);
    setTime(booking.time);
    setEditingId(booking.id);
    setError('');
  };

  // Function to save edited booking
  const saveEdit = () => {
    // Check if all fields are filled
    if (!facility || !date || !time) {
      setError('Please fill in all fields');
      return;
    }

    // Check for duplicate (excluding current booking)
    const isDuplicate = bookings.some(
      booking => 
        booking.facility === facility && 
        booking.date === date && 
        booking.time === time &&
        booking.id !== editingId
    );

    if (isDuplicate) {
      setError('This booking already exists! Please choose a different time.');
      return;
    }

    // Update the booking
    const updatedBookings = bookings.map(booking => {
      if (booking.id === editingId) {
        return { ...booking, facility, date, time };
      }
      return booking;
    });

    setBookings(updatedBookings);

    // Clear form
    setDate('');
    setTime('');
    setFacility('Room A');
    setEditingId(null);
    setError('');
  };

  // Function to cancel editing
  const cancelEdit = () => {
    setDate('');
    setTime('');
    setFacility('Room A');
    setEditingId(null);
    setError('');
  };

  return (
    <div className="App">
      <div className="container">
        {/* Page Title */}
        <h1>University Facility Booking System</h1>

        {/* Booking Form */}
        <div className="form-section">
          <h2>{editingId ? 'Edit Booking' : 'Book a Facility'}</h2>

          {/* Facility Dropdown */}
          <div className="form-group">
            <label>Select Facility:</label>
            <select value={facility} onChange={(e) => setFacility(e.target.value)}>
              <option value="Room A">Room A</option>
              <option value="Room B">Room B</option>
              <option value="Lab 1">Lab 1</option>
              <option value="Lab 2">Lab 2</option>
              <option value="Meeting Room">Meeting Room</option>
              <option value="Sports Court">Sports Court</option>
            </select>
          </div>

          {/* Date Input */}
          <div className="form-group">
            <label>Select Date:</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>

          {/* Time Input */}
          <div className="form-group">
            <label>Select Time:</label>
            <input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
            />
          </div>

          {/* Error Message */}
          {error && <p className="error">{error}</p>}

          {/* Buttons */}
          {editingId ? (
            <div className="button-group">
              <button onClick={saveEdit} className="save-btn">Save Changes</button>
              <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
            </div>
          ) : (
            <button onClick={addBooking} className="add-btn">Add Booking</button>
          )}
        </div>

        {/* Total Bookings Count */}
        <div className="total-section">
          <h3>Total Bookings: {bookings.length}</h3>
        </div>

        {/* Bookings Table */}
        <div className="table-section">
          <h2>All Bookings</h2>
          
          {bookings.length === 0 ? (
            <p>No bookings yet. Add your first booking above!</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.facility}</td>
                    <td>{booking.date}</td>
                    <td>{booking.time}</td>
                    <td>
                      <button onClick={() => startEdit(booking)} className="edit-btn">Edit</button>
                      <button onClick={() => deleteBooking(booking.id)} className="delete-btn">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;