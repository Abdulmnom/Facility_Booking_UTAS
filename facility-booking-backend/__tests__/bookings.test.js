// Use an in-memory SQLite database so tests never touch bookings.db
process.env.DATABASE_STORAGE = ':memory:';
process.env.JWT_SECRET = 'test-secret-key-ufbs';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { sequelize, syncAndSeed, User, Facility } = require('../src/models');
const jwt = require('jsonwebtoken');

let authToken;
let testFacilityId;

beforeAll(async () => {
  await syncAndSeed();
  const user = await User.findOne({ where: { email: 'admin@facility.com' } });
  authToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const facility = await Facility.findOne();
  testFacilityId = facility.id;
}, 30000);

afterAll(async () => {
  await sequelize.close();
});

const validPayload = (overrides = {}) => ({
  facility_id: testFacilityId,
  booking_date: '2030-06-15',
  start_time: '09:00',
  end_time: '10:00',
  purpose: 'Test booking',
  ...overrides,
});

describe('POST /api/bookings', () => {
  test('201: creates booking with valid integer facility_id', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPayload({ booking_date: '2030-06-15' }));

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.facility_id).toBe(testFacilityId);
    expect(res.body.start_time).toBe('09:00');
  });

  test('201: creates booking when facility_id is sent as a string (coerced by middleware)', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPayload({ facility_id: String(testFacilityId), booking_date: '2030-06-20' }));

    expect(res.status).toBe(201);
    expect(res.body.facility_id).toBe(testFacilityId);
  });

  test('400: missing required fields returns 400, not 500', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ facility_id: testFacilityId });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test('400: non-integer facility_id returns 400', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPayload({ facility_id: 'not-a-number', booking_date: '2030-07-01' }));

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('400: invalid booking_date format returns 400', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPayload({ booking_date: '15/06/2030' }));

    expect(res.status).toBe(400);
  });

  test('400: end_time before start_time returns 400', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPayload({ start_time: '11:00', end_time: '09:00', booking_date: '2030-06-25' }));

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/end_time must be after/i);
  });

  test('400: equal start_time and end_time returns 400', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPayload({ start_time: '10:00', end_time: '10:00', booking_date: '2030-06-26' }));

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/end_time must be after/i);
  });

  test('404: nonexistent facility_id returns 404', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPayload({ facility_id: 99999, booking_date: '2030-07-05' }));

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/facility not found/i);
  });

  test('409: duplicate time slot returns 409', async () => {
    const payload = validPayload({ booking_date: '2030-08-01' });
    const first = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);
    expect(second.status).toBe(409);
  });

  test('401: missing Authorization header returns 401', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send(validPayload());

    expect(res.status).toBe(401);
  });

  test('401: malformed token returns 401', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', 'Bearer not.a.valid.token')
      .send(validPayload());

    expect(res.status).toBe(401);
  });
});

describe('GET /api/bookings', () => {
  test('200: returns bookings array for authenticated user', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('401: returns 401 without token', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(401);
  });
});
