Append to README.md a Troubleshooting section:

- CORS: we call from service_worker to 127.0.0.1, FastAPI allows all; ensure URL matches.
- Mixed Content: extension context is secure; HTTP to localhost is OK. If corporate policy blocks, allowlist 127.0.0.1.
- Image tainting: we fetch garment as blob from background, not from content script, to avoid canvas taint.
- If popup shows blank: check that popup build emitted index.html + index.jsx bundle correctly and paths are relative.
- If background shows errors: chrome://extensions → Inspect views → Service worker console.
- If request fails: verify backend at http://127.0.0.1:8000/docs is reachable.

Acceptance:

- Clear, concise bullets with actionable checks.
