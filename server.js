const express = require('express');
const app = express();
const PORT = 3000;

// In-memory data stores
let courses = [
  { code: 'ICT461', title: 'Web Systems & Technologies', department: 'Computer Science' },
  { code: 'ICT451', title: 'Database Administration', department: 'Computer Science' },
  { code: 'ICT411', title: 'Software Engineering Principles', department: 'Computer Science' },
  { code: 'ICT421', title: 'Computer Networks & Security', department: 'Computer Science' }
];

let registrations = [];
let nextId = 1;
let coursesETag = '"v1-courses-hash-1001"';

// Body parsers for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Task 3.2: Explicit CORS Middleware Configuration
app.use((req, res, next) => {
  const allowedOrigin = 'http://localhost:5500';
  const origin = req.headers.origin;

  if (origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight handling
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

// Middleware to apply Cache-Control: no-store to registration endpoints
const noStore = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
};

// --- TASK 3.1: GET /api/courses with ETag and Cache-Control ---
app.get('/api/courses', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.setHeader('ETag', coursesETag);

  const clientETag = req.headers['if-none-match'];
  if (clientETag && clientETag === coursesETag) {
    return res.status(304).end(); // 304 Not Modified (no body)
  }

  res.status(200).json(courses);
});

// --- TASK 2: REGISTRATION ROUTES ---

// GET /api/registrations/:id
app.get('/api/registrations/:id', noStore, (req, res) => {
  const record = registrations.find(r => r.id === req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Registration record not found.' });
  }
  res.status(200).json(record);
});

// POST /api/registrations
app.post('/api/registrations', noStore, (req, res) => {
  const { name, studentId, programme, course } = req.body;

  // Validation
  if (!name || !studentId || !programme || !course) {
    return res.status(400).json({ error: 'All fields (name, studentId, programme, course) are required.' });
  }

  const courseExists = courses.some(c => c.code === course);
  if (!courseExists) {
    return res.status(400).json({ error: 'Invalid course selection.' });
  }

  // Reject duplicate studentId + course combination
  const duplicate = registrations.some(r => r.studentId === studentId && r.course === course);
  if (duplicate) {
    return res.status(409).json({ error: 'Student is already registered for this course.' });
  }

  const newRecord = {
    id: String(nextId++),
    name: name.trim(),
    studentId: studentId.trim(),
    programme: programme.trim(),
    course: course.trim(),
    createdAt: new Date().toISOString()
  };

  registrations.push(newRecord);

  res.setHeader('Location', `/api/registrations/${newRecord.id}`);
  res.status(201).json(newRecord);
});

// PUT /api/registrations/:id
app.put('/api/registrations/:id', noStore, (req, res) => {
  const { id } = req.params;
  const { name, studentId, programme, course } = req.body;

  const recordIndex = registrations.findIndex(r => r.id === id);
  if (recordIndex === -1) {
    return res.status(404).json({ error: 'Registration record not found.' });
  }

  // Full record validation
  if (!name || !studentId || !programme || !course) {
    return res.status(400).json({ error: 'PUT replacement requires all fields (name, studentId, programme, course).' });
  }

  // Check duplicate combination on other records
  const duplicate = registrations.some(r => r.studentId === studentId && r.course === course && r.id !== id);
  if (duplicate) {
    return res.status(409).json({ error: 'Another registration with this student ID and course already exists.' });
  }

  const updatedRecord = {
    id,
    name: name.trim(),
    studentId: studentId.trim(),
    programme: programme.trim(),
    course: course.trim(),
    updatedAt: new Date().toISOString()
  };

  registrations[recordIndex] = updatedRecord;
  res.status(200).json(updatedRecord);
});

// PATCH /api/registrations/:id
app.patch('/api/registrations/:id', noStore, (req, res) => {
  const { id } = req.params;
  const { programme } = req.body;

  const record = registrations.find(r => r.id === id);
  if (!record) {
    return res.status(404).json({ error: 'Registration record not found.' });
  }

  if (!programme || typeof programme !== 'string' || !programme.trim()) {
    return res.status(400).json({ error: 'Valid programme string is required for patch.' });
  }

  record.programme = programme.trim();
  res.status(200).json(record);
});

// DELETE /api/registrations/:id
app.delete('/api/registrations/:id', noStore, (req, res) => {
  const { id } = req.params;
  const recordIndex = registrations.findIndex(r => r.id === id);

  if (recordIndex === -1) {
    return res.status(404).json({ error: 'Registration record not found.' });
  }

  registrations.splice(recordIndex, 1);
  res.status(204).send(); // Must NOT contain a body
});

// --- TASK 2.3: Diagnostic Route ---
app.all('/inspect', (req, res) => {
  res.status(200).json({
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  });
});

// --- TASK 4.1: Cookie Demonstration Route ---
app.get('/api/cookie-demo', (req, res) => {
  res.cookie('labCookie', 'demo_token_xyz789', {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/'
  });
  res.status(200).json({ message: 'Non-sensitive demo cookie set successfully.' });
});

app.listen(PORT, () => {
  console.log(`API Server running at http://localhost:${PORT}`);
});