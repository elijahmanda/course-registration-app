import { getCourses, createRegistration, patchProgramme, deleteRegistration, triggerCookieDemo } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registration-form');
  const nameInput = document.getElementById('student-name');
  const idInput = document.getElementById('student-id');
  const programmeSelect = document.getElementById('programme');
  const courseSelect = document.getElementById('course');
  const feedbackEl = document.getElementById('feedback');
  const recordsContainer = document.getElementById('records-container');
  const cookieBtn = document.getElementById('test-cookie-btn');

  let activeRegistrations = [];

  // Task 1.3: LocalStorage Programme Preference Persistence
  const savedProgramme = localStorage.getItem('programmePref');
  if (savedProgramme) {
    programmeSelect.value = savedProgramme;
  }

  programmeSelect.addEventListener('change', () => {
    localStorage.setItem('programmePref', programmeSelect.value);
  });

  // Safe DOM text rendering helper (XSS prevention)
  function showFeedback(message, type = 'info') {
    feedbackEl.textContent = message;
    feedbackEl.className = `feedback ${type}`;
  }

  function clearFeedback() {
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback hidden';
  }

  // Load Courses catalog
  async function loadCourses() {
    try {
      const courses = await getCourses();
      courseSelect.innerHTML = '<option value="">-- Select Course --</option>';
      courses.forEach(c => {
        const option = document.createElement('option');
        option.value = c.code;
        option.textContent = `${c.code} - ${c.title}`;
        courseSelect.appendChild(option);
      });
    } catch (err) {
      showFeedback(`Failed to load courses: ${err.message}`, 'error');
    }
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFeedback();

    const name = nameInput.value.trim();
    const studentId = idInput.value.trim();
    const programme = programmeSelect.value;
    const course = courseSelect.value;

    // Client-side validation guard
    if (!name || !studentId || !programme || !course) {
      showFeedback('Please fill in all required fields.', 'error');
      return;
    }

    showFeedback('Submitting registration...', 'info');

    try {
      const result = await createRegistration({ name, studentId, programme, course });
      showFeedback(`Registration successful! Allocated ID: ${result.data.id}`, 'success');
      
      activeRegistrations.push(result.data);
      renderRecords();
      
      // Reset text inputs
      nameInput.value = '';
      idInput.value = '';
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  });

  // Render registrations safely into DOM
  function renderRecords() {
    recordsContainer.innerHTML = '';

    if (activeRegistrations.length === 0) {
      recordsContainer.innerHTML = '<p>No active registrations recorded.</p>';
      return;
    }

    activeRegistrations.forEach(record => {
      const card = document.createElement('div');
      card.className = 'record-card';

      const title = document.createElement('h3');
      title.textContent = `${record.name} (${record.studentId})`;

      const details = document.createElement('p');
      details.textContent = `Programme: ${record.programme} | Course: ${record.course}`;

      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '0.5rem';

      const updateBtn = document.createElement('button');
      updateBtn.className = 'btn btn-secondary';
      updateBtn.textContent = 'Change Programme';
      updateBtn.addEventListener('click', async () => {
        const newProg = prompt('Enter new programme:', record.programme);
        if (newProg && newProg !== record.programme) {
          try {
            const updated = await patchProgramme(record.id, newProg);
            record.programme = updated.programme;
            renderRecords();
            showFeedback('Programme updated successfully.', 'success');
          } catch (err) {
            showFeedback(err.message, 'error');
          }
        }
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn';
      deleteBtn.style.backgroundColor = '#dc2626';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', async () => {
        try {
          await deleteRegistration(record.id);
          activeRegistrations = activeRegistrations.filter(r => r.id !== record.id);
          renderRecords();
          showFeedback('Registration deleted successfully.', 'success');
        } catch (err) {
          showFeedback(err.message, 'error');
        }
      });

      actions.appendChild(updateBtn);
      actions.appendChild(deleteBtn);

      card.appendChild(title);
      card.appendChild(details);
      card.appendChild(actions);

      recordsContainer.appendChild(card);
    });
  }

  cookieBtn.addEventListener('click', async () => {
    try {
      const res = await triggerCookieDemo();
      showFeedback(res.message, 'success');
    } catch (err) {
      showFeedback('Cookie demo failed', 'error');
    }
  });

  loadCourses();
});