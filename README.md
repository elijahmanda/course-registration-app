# ICT461 Course Registration System — Technical Reference & Lab Report

Serving Interfaces:
- Frontend Portal: `http://localhost:5500`
- REST API Server: `http://localhost:3000`

---

## Task 1 Architectural Conceptualizations

### Checkpoint A Explanations
1. **Data Flow**: `Browser (Client Fetch)` $\rightarrow$ `Web Server (Static Assets)` $\rightarrow$ `Application Server (Express routes)` $\rightarrow$ `Data Store (In-memory Array)`.
2. **Validation Location**:
   - **Client-side validation** provides immediate UI feedback and improves user experience.
   - **Server-side validation** is the absolute security boundary. Client-side checks can easily be bypassed (e.g., cURL, Postman); therefore, server-side validation is mandatory.
3. **Standards Bodies**:
   - **HTML**: WHATWG (Web Hypertext Application Technology Working Group) & W3C.
   - **ECMAScript**: TC39 (Ecma International Technical Committee 39).
   - **HTTP**: IETF (Internet Engineering Task Force).
4. **Storage Differences**:
   - `localStorage`: Persists data across browser sessions and reloads until explicitly cleared.
   - `sessionStorage`: Cleared automatically when the specific browser tab or window session closes.

---

## Task 2 HTTP Route Contract Specification

| Method | Route | Request Body | Success Code | Failure Code 1 | Failure Code 2 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | None | `200 OK` | `500 Internal Error` | N/A |
| `GET` | `/api/registrations/:id` | None | `200 OK` | `404 Not Found` | `500 Internal Error` |
| `POST` | `/api/registrations` | `{name, studentId, programme, course}` | `201 Created` | `400 Bad Request` | `409 Conflict` |
| `PUT` | `/api/registrations/:id` | `{name, studentId, programme, course}` | `200 OK` | `400 Bad Request` | `404 Not Found` |
| `PATCH` | `/api/registrations/:id` | `{programme}` | `200 OK` | `400 Bad Request` | `404 Not Found` |
| `DELETE` | `/api/registrations/:id` | None | `204 No Content` | `404 Not Found` | `500 Internal Error` |

### Idempotency Explanation
An HTTP method is **idempotent** if making multiple identical requests has the same side-effect on the server state as a single request.
- `GET`, `PUT`, and `DELETE` are idempotent. Deleting a resource once removes it; repeating `DELETE /api/registrations/1` returns `404`, but the server state remains unchanged (resource stays deleted).
- `POST` is **non-idempotent**. Executing `POST /api/registrations` twice creates two distinct records or yields duplicate errors on the second call.

---

## Task 3 Caching & Browser Boundaries

1. **Freshness vs. Revalidation**:
   - **Freshness (`max-age=60`)**: Browser serves the resource directly from browser cache without making a network request during the freshness window.
   - **Revalidation (`ETag` / `If-None-Match`)**: Once expired or when forced, the browser asks the server if the cache is still valid. If unchanged, server sends `304 Not Modified` with an empty body, saving bandwidth.
2. **CORS Boundary Behavior**:
   - Browsers enforce the Same-Origin Policy (SOP). Port `5500` contacting Port `3000` is a cross-origin request.
   - For non-simple requests, browsers dispatch an `OPTIONS` preflight request to verify `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers`.

---

## Task 4 Security & Performance Analysis

1. **Cookie Flags & Security**:
   - `HttpOnly`: Prevents client-side JavaScript (`document.cookie`) from reading the cookie, mitigating XSS session theft.
   - `Secure`: Ensures cookies are transmitted exclusively over encrypted HTTPS connections.
   - `SameSite=Lax`: Restricts cookie transmission on cross-site requests, protecting against CSRF attacks.
   - **Bearer Tokens vs Cookies**: Bearer tokens are stored in memory/localStorage and sent via `Authorization` headers (immune to CSRF, vulnerable to XSS). Cookies are managed natively by the browser (vulnerable to CSRF unless protected by SameSite/tokens, protected against XSS via `HttpOnly`).
2. **HTTP Protocols**:
   - **HTTP/2**: Introduces binary framing and **multiplexing** (parallel requests over a single TCP connection, eliminating head-of-line blocking at the application layer).
   - **HTTP/3**: Operates over **QUIC (UDP)** instead of TCP, eliminating transport-level head-of-line blocking and reducing connection handshake latency.