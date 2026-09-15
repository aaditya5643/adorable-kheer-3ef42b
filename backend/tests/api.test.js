const request = require('supertest');
const app = require('../src/app');
const runSeed = require('../src/db/seed');

describe('School Management System (SMS) API Integration Tests', () => {
  beforeAll(() => {
    runSeed();
  });

  let adminToken = '';
  let teacherToken = '';
  let studentToken = '';
  let parentToken = '';
  let sampleStudentId = null;
  let sampleClassId = null;

  test('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.system).toBe('School Management System (SMS) API');
  });

  test('GET /api/auth/demo-accounts returns demo profiles', async () => {
    const res = await request(app).get('/api/auth/demo-accounts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accounts.length).toBe(4);
  });

  test('POST /api/auth/login succeeds for Admin', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@techschool.edu', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
  });

  test('POST /api/auth/login succeeds for Teacher', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sarah.jenkins@techschool.edu', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('teacher');
    teacherToken = res.body.token;
  });

  test('POST /api/auth/login succeeds for Student', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'liam.johnson@techschool.edu', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('student');
    studentToken = res.body.token;
    sampleStudentId = res.body.user.student_id;
    sampleClassId = res.body.user.class_id;
  });

  test('POST /api/auth/login succeeds for Parent', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'robert.johnson@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('parent');
    expect(Array.isArray(res.body.user.children)).toBe(true);
    parentToken = res.body.token;
  });

  test('RBAC: Student should be rejected when listing all students', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Admin can list all students', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.students)).toBe(true);
    expect(res.body.students.length).toBeGreaterThan(0);
  });

  test('Admin can fetch school overview metrics', async () => {
    const res = await request(app)
      .get('/api/reports/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.overview.total_students).toBeGreaterThan(0);
    expect(res.body.overview.total_teachers).toBeGreaterThan(0);
  });

  test('Teacher can fetch class attendance sheet', async () => {
    const res = await request(app)
      .get(`/api/attendance/class/${sampleClassId}`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.roster)).toBe(true);
  });

  test('Teacher can submit batch attendance', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(app)
      .post('/api/attendance/batch')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        class_id: sampleClassId,
        date: today,
        records: [
          { student_id: sampleStudentId, status: 'present', remarks: 'Present and alert' }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Student can fetch their formal report card', async () => {
    const res = await request(app)
      .get(`/api/grades/report-card/${sampleStudentId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.report_card).toBeDefined();
    expect(res.body.report_card.summary.gpa).toBeDefined();
    expect(Array.isArray(res.body.report_card.subjects)).toBe(true);
  });
});
