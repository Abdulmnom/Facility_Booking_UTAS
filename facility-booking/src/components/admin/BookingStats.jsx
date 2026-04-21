import React from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';

export default function BookingStats({ stats }) {
  if (!stats) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
        <Spinner animation="border" style={{ color: 'var(--clr-teal)' }} />
      </div>
    );
  }

  const summaryCards = [
    { label: 'Total Bookings',    value: stats.totalBookings,    icon: '📅' },
    { label: 'Active Users',      value: stats.totalUsers,        icon: '👥' },
    { label: 'Active Facilities', value: stats.totalFacilities,   icon: '🏛' },
  ];

  return (
    <div>
      {/* Summary cards */}
      <Row className="g-3 mb-4">
        {summaryCards.map((c) => (
          <Col key={c.label} xs={12} sm={4}>
            <div className="stat-card">
              <div className="stat-label">{c.icon} &nbsp;{c.label}</div>
              <div className="stat-value">{c.value}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row className="g-3">
        <Col xs={12} lg={6}>
          <div className="dark-card">
            <div className="card-header-label">Bookings per Facility</div>
            <div style={{ padding: '20px 16px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.byFacility} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="facilityName" tick={{ fontSize: 11, fill: 'var(--clr-muted)' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--clr-muted)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--clr-teal)', borderRadius: 7, color: '#fff' }}
                    cursor={{ fill: 'rgba(0,196,167,.1)' }}
                  />
                  <Bar dataKey="count" fill="var(--clr-teal)" radius={[5, 5, 0, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        <Col xs={12} lg={6}>
          <div className="dark-card">
            <div className="card-header-label">Bookings per Day (Last 30 Days)</div>
            <div style={{ padding: '20px 16px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.byDay || []} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="booking_date" tick={{ fontSize: 10, fill: 'var(--clr-muted)' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--clr-muted)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--clr-teal)', borderRadius: 7, color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: 'var(--clr-muted)' }} />
                  <Line type="monotone" dataKey="count" stroke="var(--clr-teal)" strokeWidth={2.5} dot={false} name="Bookings" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
