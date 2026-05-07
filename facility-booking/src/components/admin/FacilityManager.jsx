import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Table } from 'react-bootstrap';
import api from '../../api/axios';

export default function FacilityManager() {
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'classroom', capacity: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchAll = () => api.get('/api/facilities').then((r) => setFacilities(r.data)).catch(() => {});
  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editId) { await api.put(`/api/facilities/${editId}`, form); setMessage('Facility updated.'); }
      else        { await api.post('/api/facilities', form);          setMessage('Facility created.'); }
      setForm({ name: '', type: 'classroom', capacity: '' }); setEditId(null);
      fetchAll(); setTimeout(() => setMessage(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Error saving facility'); }
  };

  const handleEdit = (f) => { setEditId(f.id); setForm({ name: f.name, type: f.type, capacity: f.capacity }); };
  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this facility?')) return;
    await api.delete(`/api/facilities/${id}`); fetchAll();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Add/Edit form */}
      <div className="dark-card">
        <div className="card-header-label">{editId ? 'Edit Facility' : 'Add New Facility'}</div>
        <div style={{ padding: 20 }}>
          {message && <div className="alert-dark-success mb-3">{message}</div>}
          {error   && <div className="alert-dark-error  mb-3">{error}</div>}
          <Form onSubmit={handleSubmit}>
            <Row className="g-2">
              <Col xs={12} sm={4}>
                <Form.Label>Name</Form.Label>
                <Form.Control name="name" value={form.name} onChange={handleChange} required
                  placeholder="e.g. Room A" className="dark-input" />
              </Col>
              <Col xs={12} sm={4}>
                <Form.Label>Type</Form.Label>
                <Form.Select name="type" value={form.type} onChange={handleChange} className="dark-input">
                  <option value="classroom">Classroom</option>
                  <option value="lab">Lab</option>
                  <option value="meeting">Meeting Room</option>
                  <option value="sports">Sports</option>
                </Form.Select>
              </Col>
              <Col xs={12} sm={4}>
                <Form.Label>Capacity</Form.Label>
                <Form.Control type="number" name="capacity" value={form.capacity} onChange={handleChange}
                  required min={1} placeholder="e.g. 30" className="dark-input" style={{ colorScheme: 'dark' }} />
              </Col>
              <Col xs={12} className="d-flex gap-2">
                <Button type="submit" className="btn-teal btn">{editId ? 'Update' : '+ Add Facility'}</Button>
                {editId && (
                  <Button type="button" className="btn-outline-muted btn"
                    onClick={() => { setEditId(null); setForm({ name:'', type:'classroom', capacity:'' }); }}>
                    Cancel
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
        </div>
      </div>

      {/* Facilities table */}
      <div className="dark-card">
        <div className="card-header-label">Active Facilities</div>
        <div className="table-responsive">
          <Table className="dark-table mb-0">
            <thead>
              <tr><th>Name</th><th>Type</th><th>Capacity</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {facilities.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>{f.name}</td>
                  <td style={{ textTransform: 'capitalize', color: 'var(--clr-muted)' }}>{f.type}</td>
                  <td>{f.capacity}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn-tbl btn-tbl-teal" style={{ marginRight: 12 }} onClick={() => handleEdit(f)}>
                      ✎ Edit
                    </button>
                    <button className="btn-tbl btn-tbl-red" onClick={() => handleDeactivate(f.id)}>
                      ✕ Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="table-footer-bar">Total Facilities: {facilities.length}</div>
      </div>
    </div>
  );
}
