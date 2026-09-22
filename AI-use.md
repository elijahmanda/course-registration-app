# AI Assistance Disclosure Log

| Date | Prompt / Question | AI Suggestion Used / Rejected | Test Performed | Learning Outcome |
| :--- | :--- | :--- | :--- | :--- |
| 2026-09-22 | "How to setup ETag and 304 handling in Express?" | Used conditional check on `req.headers['if-none-match']` | Executed cURL `GET /api/courses` with `If-None-Match: "v1-courses-hash-1001"` | Learned how HTTP conditional GET requests avoid re-transmitting unchanged response bodies. |
| 2026-09-22 | "Why does fetch fail on 204 response when calling .json()?" | Used early return on 204 status without calling `res.json()` | Sent `DELETE` request via fetch helper | Discovered that 204 No Content responses contain no response body, making JSON parsing fail. |