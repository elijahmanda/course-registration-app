const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Pre-seeded Course Catalog
let courses = [
  { id: 'CS101', code: 'CS101', title: 'Intro to Computer Science', credits: 4, department: 'Engineering' },
  { id: 'MATH201', code: 'MATH201', title: 'Linear Algebra', credits: 3, department: 'Mathematics' },
  { id: 'ENG102', code: 'ENG102', title: 'Academic Writing', credits: 3, department: 'Humanities' },
  { id: 'ART110', code: 'ART110', title: 'Digital Design Principles', credits: 3, department: 'Arts' },
  { id: 'DATA301', code: 'DATA301', title: 'Data Structures & Algorithms', credits: 4, department: 'Engineering' }
];

let students = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.j@university.edu',
    enrolledCourses: ['CS101', 'MATH201'],
    createdAt: new Date().toISOString()
  }
];
let nextStudentId = 2;

// --- COURSES ENDPOINTS ---

// GET /api/courses - List all available courses
app.get('/api/courses', (req, res) => {
  res.json(courses);
});

// --- STUDENT CRUD ENDPOINTS ---

// GET /api/students - Get all students
app.get('/api/students', (req, res) => {
  res.json(students);
});

// POST /api/students - Create a new student
app.post('/api/students', (req, res) => {
  const { name, email } = req.body;

  if (!name || !name.trim() || !email || !email.trim()) {
    return res.status(400).json({ error: 'Name and email are required fields.' });
  }

  const student = {
    id: String(nextStudentId++),
    name: name.trim(),
    email: email.trim(),
    enrolledCourses: [],
    createdAt: new Date().toISOString()
  };

  students.push(student);
  res.status(201).json(student);
});

// PATCH /api/students/:id - Update student details
app.patch('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  const student = students.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  if (typeof name === 'string') {
    if (!name.trim()) return res.status(400).json({ error: 'Name cannot be empty.' });
    student.name = name.trim();
  }

  if (typeof email === 'string') {
    if (!email.trim()) return res.status(400).json({ error: 'Email cannot be empty.' });
    student.email = email.trim();
  }

  res.json(student);
});

// DELETE /api/students/:id - Delete student
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const index = students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  students.splice(index, 1);
  res.status(204).send();
});

// --- ENROLLMENT ENDPOINTS ---

// POST /api/students/:id/courses - Enroll student in a course
app.post('/api/students/:id/courses', (req, res) => {
  const { id } = req.params;
  const { courseId } = req.body;

  const student = students.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  const courseExists = courses.some(c => c.id === courseId);
  if (!courseExists) {
    return res.status(404).json({ error: 'Course not found in catalog.' });
  }

  if (student.enrolledCourses.includes(courseId)) {
    return res.status(400).json({ error: 'Student is already enrolled in this course.' });
  }

  student.enrolledCourses.push(courseId);
  res.status(200).json(student);
});

// DELETE /api/students/:id/courses/:courseId - Drop course enrollment
app.delete('/api/students/:id/courses/:courseId', (req, res) => {
  const { id, courseId } = req.params;

  const student = students.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  student.enrolledCourses = student.enrolledCourses.filter(cId => cId !== courseId);
  res.status(200).json(student);
});

app.listen(PORT, () => {
  console.log(`Course Registration Server running at http://localhost:${PORT}`);
});