import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';

export default function RegisterForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const res = await api.post('/api/auth/register', payload);
      login(res.data.token, res.data.user);
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container style={{ maxWidth: 420 }}>
        <div className="text-center mb-3">
          <span style={{ color: 'var(--clr-teal)', textTransform: 'uppercase', letterSpacing: '.14em', fontSize: '.72rem', fontWeight: 700 }}>
            Sample Screens
          </span>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.8rem', marginTop: 6 }}>
            Create Account
          </h2>
          <p style={{ color: 'var(--clr-muted)', fontSize: '.88rem' }}>Join the University Facility Booking System</p>
        </div>

        <div className="dark-card">
          <div className="card-header-label">Register</div>
          <div style={{ padding: 28 }}>
            {error && <div className="alert-dark-error mb-3">{error}</div>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text" name="name" value={form.name}
                  onChange={handleChange} required placeholder="e.g. Abdulmnoum Abdullah"
                  className="dark-input" style={{ colorScheme: 'dark' }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email" name="email" value={form.email}
                  onChange={handleChange} required placeholder="student@university.edu"
                  className="dark-input" style={{ colorScheme: 'dark' }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password" name="password" value={form.password}
                  onChange={handleChange} required minLength={8} placeholder="Min. 8 characters"
                  className="dark-input" style={{ colorScheme: 'dark' }}
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password" name="confirmPassword" value={form.confirmPassword}
                  onChange={handleChange} required placeholder="Re-enter password"
                  className="dark-input" style={{ colorScheme: 'dark' }}
                />
              </Form.Group>
              <Button type="submit" className="btn-teal btn w-100 py-2" disabled={loading}>
                {loading ? <Spinner size="sm" animation="border" /> : '+ Create Account'}
              </Button>
            </Form>
            <p className="text-center mt-3" style={{ color: 'var(--clr-muted)', fontSize: '.85rem' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--clr-teal)', textDecoration: 'none', fontWeight: 600 }}>
                Login here
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
