import React, { useState, useEffect } from 'react';
import { Container, Nav } from 'react-bootstrap';
import api from '../../api/axios';
import BookingStats from './BookingStats';
import UserList from './UserList';
import FacilityManager from './FacilityManager';
import AllBookings from './AllBookings';

const TABS = ['Stats', 'Users', 'Facilities', 'All Bookings'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Stats');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/api/admin/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingBottom: 40 }}>

      {/* Page header */}
      <div className="page-header">
        <Container fluid="xl">
          <span className="page-header-eyebrow">Admin Panel</span>
          <h1 className="page-header-title">Admin Dashboard</h1>
        </Container>
      </div>

      <Container fluid="xl" style={{ marginTop: 28 }}>
        {/* Tabs — .tab-btn is now defined in index.css, works alongside .nav-link */}
        <Nav variant="tabs" className="dark-tabs">
          {TABS.map((t) => (
            <Nav.Item key={t}>
              <Nav.Link
                className={`tab-btn${activeTab === t ? ' active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        {activeTab === 'Stats'        && <BookingStats stats={stats} />}
        {activeTab === 'Users'        && <UserList />}
        {activeTab === 'Facilities'   && <FacilityManager />}
        {activeTab === 'All Bookings' && <AllBookings />}
      </Container>
    </div>
  );
}
