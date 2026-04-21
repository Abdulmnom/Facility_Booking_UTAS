import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../../api/axios';

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/bookings')
      .then((res) => {
        const mapped = res.data
          .filter((b) => b.status !== 'cancelled')
          .map((b) => ({
            id: String(b.id),
            title: b.facility?.name || 'Booking',
            start: `${b.booking_date}T${b.start_time}`,
            end: `${b.booking_date}T${b.end_time}`,
            extendedProps: { purpose: b.purpose, status: b.status },
            backgroundColor: b.status === 'confirmed' ? '#22c55e' : '#3b82f6',
            borderColor: b.status === 'confirmed' ? '#16a34a' : '#2563eb',
          }));
        setEvents(mapped);
      })
      .catch(() => setError('Could not load calendar events. Please refresh.'));
  }, []);

  return (
    <div className="dark-card" style={{ padding: 24 }}>
      {error && <div className="alert-dark-error mb-3">{error}</div>}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        height="auto"
        nowIndicator
        eventContent={(eventInfo) => (
          <div style={{ fontSize: '.75rem', padding: '0 2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            <strong>{eventInfo.event.title}</strong>
            {eventInfo.event.extendedProps.purpose && (
              <span> — {eventInfo.event.extendedProps.purpose}</span>
            )}
          </div>
        )}
      />
    </div>
  );
}
