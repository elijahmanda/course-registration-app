const API_BASE = 'http://localhost:3000/api';

/**
 * Fetch Helper Module
 */
export async function getCourses() {
  const res = await fetch(`${API_BASE}/courses`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load courses`);
  return res.json();
}

export async function createRegistration(data) {
  const res = await fetch(`${API_BASE}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });

  const responseData = await res.json();
  if (!res.ok) {
    throw new Error(responseData.error || `Error ${res.status}`);
  }
  return { status: res.status, data: responseData, location: res.headers.get('Location') };
}

export async function patchProgramme(id, programme) {
  const res = await fetch(`${API_BASE}/registrations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ programme })
  });

  const responseData = await res.json();
  if (!res.ok) throw new Error(responseData.error || `Error ${res.status}`);
  return responseData;
}

export async function deleteRegistration(id) {
  const res = await fetch(`${API_BASE}/registrations/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Delete failed' }));
    throw new Error(errorData.error || `Error ${res.status}`);
  }
  // 204 No Content has no body — DO NOT parse as JSON
  return true;
}

export async function triggerCookieDemo() {
  const res = await fetch(`${API_BASE}/cookie-demo`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Cookie request failed');
  return res.json();
}