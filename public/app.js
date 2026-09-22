document.addEventListener('DOMContentLoaded', () => {
  const studentForm = document.getElementById('student-form');
  const nameInput = document.getElementById('student-name');
  const emailInput = document.getElementById('student-email');
  const studentListEl = document.getElementById('student-list');
  const courseCatalogEl = document.getElementById('course-catalog');
  const studentCountEl = document.getElementById('student-count');
  const courseCountEl = document.getElementById('course-count');

  let students = [];
  let courses = [];

  // Fetch initial data
  const init = async () => {
    await Promise.all([fetchCourses(), fetchStudents()]);
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      courses = await response.json();
      renderCourses();
    } catch (err) {
      console.error('Error loading courses:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      students = await response.json();
      renderStudents();
    } catch (err) {
      console.error('Error loading students:', err);
    }
  };

  // Add Student (Create)
  studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !email) return;

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });

      if (response.ok) {
        const newStudent = await response.json();
        students.push(newStudent);
        nameInput.value = '';
        emailInput.value = '';
        renderStudents();
      }
    } catch (err) {
      console.error('Failed to create student:', err);
    }
  });

  // Edit Student (Update)
  const editStudent = async (student) => {
    const newName = prompt('Update Name:', student.name);
    if (newName === null) return; // user cancelled

    const newEmail = prompt('Update Email:', student.email);
    if (newEmail === null) return;

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail })
      });

      if (response.ok) {
        const updated = await response.json();
        students = students.map(s => s.id === updated.id ? updated : s);
        renderStudents();
      }
    } catch (err) {
      console.error('Failed to update student:', err);
    }
  };

  // Delete Student (Delete)
  const deleteStudent = async (id) => {
    if (!confirm('Are you sure you want to remove this student?')) return;

    try {
      const response = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (response.ok) {
        students = students.filter(s => s.id !== id);
        renderStudents();
      }
    } catch (err) {
      console.error('Failed to delete student:', err);
    }
  };

  // Enroll Course
  const enrollCourse = async (studentId, courseId) => {
    if (!courseId) return;

    try {
      const response = await fetch(`/api/students/${studentId}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });

      if (response.ok) {
        const updatedStudent = await response.json();
        students = students.map(s => s.id === studentId ? updatedStudent : s);
        renderStudents();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to enroll');
      }
    } catch (err) {
      console.error('Error enrolling course:', err);
    }
  };

  // Drop Course
  const dropCourse = async (studentId, courseId) => {
    try {
      const response = await fetch(`/api/students/${studentId}/courses/${courseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const updatedStudent = await response.json();
        students = students.map(s => s.id === studentId ? updatedStudent : s);
        renderStudents();
      }
    } catch (err) {
      console.error('Error dropping course:', err);
    }
  };

  // Render Course Catalog
  const renderCourses = () => {
    courseCountEl.textContent = courses.length;
    courseCatalogEl.innerHTML = '';

    courses.forEach(course => {
      const card = document.createElement('div');
      card.className = 'course-card';
      card.innerHTML = `
        <div class="course-details">
          <h4>${course.code}: ${course.title}</h4>
          <p>${course.department} • ${course.credits} Credits</p>
        </div>
        <span class="course-badge">${course.code}</span>
      `;
      courseCatalogEl.appendChild(card);
    });
  };

  // Render Students & Registrations
  const renderStudents = () => {
    studentCountEl.textContent = students.length;
    studentListEl.innerHTML = '';

    if (students.length === 0) {
      studentListEl.innerHTML = `
        <div class="empty-state">No students registered yet. Add a student to get started!</div>
      `;
      return;
    }

    students.forEach(student => {
      const card = document.createElement('div');
      card.className = 'student-card';

      // Header row with student info & actions
      const header = document.createElement('div');
      header.className = 'student-header';

      const info = document.createElement('div');
      info.className = 'student-info';
      info.innerHTML = `
        <h4>${student.name}</h4>
        <p>${student.email}</p>
      `;

      const actions = document.createElement('div');
      actions.className = 'student-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary';
      editBtn.style.padding = '0.3rem 0.6rem';
      editBtn.style.fontSize = '0.75rem';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => editStudent(student));

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-danger-soft';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteStudent(student.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      header.appendChild(info);
      header.appendChild(actions);

      // Enrolled course tags
      const enrollmentSection = document.createElement('div');
      enrollmentSection.className = 'enrollment-section';

      const title = document.createElement('div');
      title.className = 'enrollment-title';
      title.textContent = `Registered Courses (${student.enrolledCourses.length})`;

      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'course-tags';

      if (student.enrolledCourses.length === 0) {
        tagsContainer.innerHTML = `<span style="font-size: 0.75rem; color: var(--text-muted);">No courses registered</span>`;
      } else {
        student.enrolledCourses.forEach(courseId => {
          const course = courses.find(c => c.id === courseId);
          const courseCode = course ? course.code : courseId;

          const tag = document.createElement('span');
          tag.className = 'tag';
          tag.innerHTML = `
            ${courseCode}
          `;

          const removeBtn = document.createElement('button');
          removeBtn.className = 'tag-remove';
          removeBtn.innerHTML = '&times;';
          removeBtn.title = 'Drop course';
          removeBtn.addEventListener('click', () => dropCourse(student.id, courseId));

          tag.appendChild(removeBtn);
          tagsContainer.appendChild(tag);
        });
      }

      // Course enrollment dropdown
      const enrollControl = document.createElement('div');
      enrollControl.className = 'enroll-control';

      const select = document.createElement('select');
      select.innerHTML = `<option value="">-- Enroll in a Course --</option>`;

      // Filter out courses the student is already enrolled in
      const availableCourses = courses.filter(c => !student.enrolledCourses.includes(c.id));
      availableCourses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.code} - ${c.title}`;
        select.appendChild(opt);
      });

      const enrollBtn = document.createElement('button');
      enrollBtn.className = 'btn btn-primary';
      enrollBtn.style.padding = '0.35rem 0.75rem';
      enrollBtn.style.fontSize = '0.75rem';
      enrollBtn.textContent = 'Enroll';
      enrollBtn.disabled = availableCourses.length === 0;

      enrollBtn.addEventListener('click', () => {
        if (select.value) {
          enrollCourse(student.id, select.value);
        }
      });

      enrollControl.appendChild(select);
      enrollControl.appendChild(enrollBtn);

      enrollmentSection.appendChild(title);
      enrollmentSection.appendChild(tagsContainer);
      enrollmentSection.appendChild(enrollControl);

      card.appendChild(header);
      card.appendChild(enrollmentSection);

      studentListEl.appendChild(card);
    });
  };

  init();
});