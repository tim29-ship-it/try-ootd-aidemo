You are an expert Python backend dev. Inside ./backend create:

Files:

1. requirements.txt

   - fastapi
   - uvicorn[standard]
   - pillow

2. app.py

   - FastAPI app with CORS allowing all origins (dev only).
   - POST /tryon:
     - multipart form-data fields: user_photo (file), garment_img (file)
     - read both into Pillow RGBA
     - resize garment to ~60% of user width, keep aspect
     - paste garment roughly at upper body (25% height from top)
     - return JSON {"image_base64": "<base64 PNG>"}

3. run.bat (Windows):
   - creates venv .venv, activates it, installs requirements, runs uvicorn

Acceptance:

- Running `backend\run.bat` on Windows starts server at http://127.0.0.1:8000
- Manual test: curl with two images returns JSON containing "image_base64".
- Code is concise, commented where logic is “placeholder for future try-on”.
  You are an expert Python backend dev. Inside ./backend create:

Files:

1. requirements.txt

   - fastapi
   - uvicorn[standard]
   - pillow

2. app.py

   - FastAPI app with CORS allowing all origins (dev only).
   - POST /tryon:
     - multipart form-data fields: user_photo (file), garment_img (file)
     - read both into Pillow RGBA
     - resize garment to ~60% of user width, keep aspect
     - paste garment roughly at upper body (25% height from top)
     - return JSON {"image_base64": "<base64 PNG>"}

3. run.bat (Windows):
   - creates venv .venv, activates it, installs requirements, runs uvicorn

Acceptance:

- Running `backend\run.bat` on Windows starts server at http://127.0.0.1:8000
- Manual test: curl with two images returns JSON containing "image_base64".
- Code is concise, commented where logic is “placeholder for future try-on”.
