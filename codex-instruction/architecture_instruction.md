You are a senior full-stack engineer. Create a minimal, runnable prototype for a local virtual try-on demo with:

- Backend: Python FastAPI (localhost:8000), endpoint POST /tryon that accepts two images (user_photo, garment_img) and returns a base64 PNG after a simple overlay compositing (placeholder for future VITON-style models).
- Frontend: Chrome Extension (Manifest V3) with:
  - popup React UI (Vite + React, runs inside extension/popup),
  - a background service worker,
  - a content script that helps pick an image from any page,
  - context menu "试穿此图",
  - fetches the backend and shows result.

Produce the folder layout (no code yet), like:
root/
backend/
extension/
popup/
.gitignore
README.md

Acceptance:

- Clear directories only; no files yet.
- Short README that explains what goes where, and how we will fill them in next.
