import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BSNav, Nav, Container, Badge } from 'react-bootstrap';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); setExpanded(false); };
  const isActive = (p) => location.pathname === p;

  const navLinkStyle = (p) => ({
    color: isActive(p) ? 'var(--clr-teal)' : 'var(--clr-muted)',
    fontWeight: 600,
    fontSize: '.88rem',
    letterSpacing: '.04em',
    textDecoration: 'none',
    borderBottom: isActive(p) ? '2px solid var(--clr-teal)' : '2px solid transparent',
    paddingBottom: 2,
    transition: 'color .2s',
  });

  return (
    <BSNav
      expanded={expanded}
      expand="md"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '1.5px solid rgba(0,196,167,.25)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Container fluid="xl">
        {/* Brand */}
        <BSNav.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <span style={{
            background: 'var(--clr-teal)', color: '#001f18', fontWeight: 800,
            fontSize: '.68rem', padding: '3px 8px', borderRadius: 4, letterSpacing: '.1em',
          }}>UFBS</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
            University Facility Booking
          </span>
        </BSNav.Brand>

        {/* Hamburger */}
        <BSNav.Toggle
          onClick={() => setExpanded((e) => !e)}
          style={{ borderColor: 'rgba(0,196,167,.4)' }}
        >
          <span style={{ color: 'var(--clr-teal)', fontSize: '1.2rem' }}>☰</span>
        </BSNav.Toggle>

        <BSNav.Collapse>
          <Nav className="ms-auto align-items-center gap-2 py-2 py-md-0">
            {user ? (
              <>
                <Nav.Link as={Link} to="/bookings" onClick={() => setExpanded(false)} style={navLinkStyle('/bookings')}>
                  My Bookings
                </Nav.Link>
                <Nav.Link as={Link} to="/calendar" onClick={() => setExpanded(false)} style={navLinkStyle('/calendar')}>
                  Calendar
                </Nav.Link>
                {isAdmin && (
                  <Nav.Link as={Link} to="/admin" onClick={() => setExpanded(false)} style={navLinkStyle('/admin')}>
                    Admin
                    <Badge bg="" style={{ background:'var(--clr-teal)', color:'#001f18', marginLeft:5, fontSize:'.65rem' }}>A</Badge>
                  </Nav.Link>
                )}
                <span style={{ color: 'var(--clr-muted)', fontSize: '.82rem', padding: '0 8px' }}>
                  👤 {user.name}
                </span>
                <button onClick={handleLogout} className="btn-outline-muted btn"
                  style={{ padding: '6px 18px', fontSize: '.82rem' }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" onClick={() => setExpanded(false)} style={navLinkStyle('/login')}>
                  Login
                </Nav.Link>
                <Link to="/register" onClick={() => setExpanded(false)}
                  className="btn btn-teal"
                  style={{ fontSize: '.82rem', padding: '7px 18px' }}>
                  Register
                </Link>
              </>
            )}
          </Nav>
        </BSNav.Collapse>
      </Container>
    </BSNav>
  );
}
