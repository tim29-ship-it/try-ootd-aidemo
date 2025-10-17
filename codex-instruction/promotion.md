Modify backend/app.py:

- Add comments where to replace simple overlay with:
  (1) human parsing upper-body mask (e.g., Mediapipe or HF models),
  (2) Thin Plate Spline warping,
  (3) front/back layering around hair/arms.

- Expose GET /health that returns {"ok": true}.
- Keep code clean and typed hints where trivial.

Acceptance:

- GET /health returns ok.
- Code comments clearly mark "upgrade hooks".
