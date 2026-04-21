import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container style={{ maxWidth: 420 }}>
        {/* Header label */}
        <div className="text-center mb-3">
          <span style={{ color: 'var(--clr-teal)', textTransform: 'uppercase', letterSpacing: '.14em', fontSize: '.72rem', fontWeight: 700 }}>
            Sample Screens
          </span>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.8rem', marginTop: 6 }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--clr-muted)', fontSize: '.88rem' }}>Sign in to your account</p>
        </div>

        <div className="dark-card">
          <div className="card-header-label">Login</div>
          <div style={{ padding: 28 }}>
            {error && <div className="alert-dark-error mb-3">{error}</div>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email" name="email" value={form.email}
                  onChange={handleChange} required
                  placeholder="student@university.edu"
                  className="dark-input"
                  style={{ colorScheme: 'dark' }}
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password" name="password" value={form.password}
                  onChange={handleChange} required
                  placeholder="••••••••"
                  className="dark-input"
                  style={{ colorScheme: 'dark' }}
                />
              </Form.Group>
              <Button type="submit" className="btn-teal btn w-100 py-2" disabled={loading}>
                {loading ? <Spinner size="sm" animation="border" /> : '+ Login'}
              </Button>
            </Form>
            <p className="text-center mt-3" style={{ color: 'var(--clr-muted)', fontSize: '.85rem' }}>
              No account?{' '}
              <Link to="/register" style={{ color: 'var(--clr-teal)', textDecoration: 'none', fontWeight: 600 }}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
