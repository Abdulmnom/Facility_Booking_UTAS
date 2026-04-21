import React from 'react';
import { Container } from 'react-bootstrap';
import CalendarView from '../components/bookings/CalendarView';

export default function CalendarPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingBottom: 40 }}>
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid rgba(0,196,167,.18)', padding: '24px 0 20px' }}>
        <Container fluid="xl">
          <span style={{ color: 'var(--clr-teal)', textTransform: 'uppercase', letterSpacing: '.14em', fontSize: '.72rem', fontWeight: 700 }}>
            Sample Screens
          </span>
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '2rem', marginTop: 6, marginBottom: 0 }}>
            Booking Calendar
          </h1>
        </Container>
      </div>
      <Container fluid="xl" style={{ marginTop: 28 }}>
        <div className="dark-card">
          <div className="card-header-label">Booking Calendar</div>
          <div style={{ padding: 20 }}>
            <CalendarView />
          </div>
        </div>
      </Container>
    </div>
  );
}
