# Try OOTD AI Demo

## Layout
- `backend/`: FastAPI service that will expose `POST /tryon`, accept two images, and return a composited PNG placeholder.
- `extension/`: Chrome extension shell (Manifest V3) with background worker, content script, and context menu wiring.
- `popup/`: Vite + React UI that lives in the extension popup and calls the backend to preview results.

## Backend Quickstart
- Run `backend\run.bat` to create the virtualenv, install requirements, and launch the API at `http://127.0.0.1:8000`.
- Ping the service with `curl -X POST -F "user_photo=@me.png" -F "garment_img=@shirt.png" http://127.0.0.1:8000/tryon`.
- Optionally test via `python backend/test_client.py path/to/me.png path/to/shirt.png` which saves `out.png` beside the script.

## Build the Extension Popup
- Run `build-extension.bat` (root) or run the commands manually:
  1. `cd extension/popup`
  2. `npm install`
  3. `npm run build`
- The build writes assets in-place so `extension/popup/index.html` stays as the popup entry point.

## Load the Extension (Chrome)
- Open Chrome and navigate to `chrome://extensions`.
- Enable **Developer Mode**.
- Click **Load unpacked** and pick the `extension` folder.
- Confirm the extension appears (🙌 add your own screenshot here).

## End-to-End Try-On Test
- Ensure the backend server is running (`backend\run.bat`).
- In the popup, upload your own photo (placeholder screenshot).
- Browse to a shopping site, hover and right-click a product photo, choose **试穿此图**.
- The result opens in a new tab or appears in the popup preview (add screenshot showing success).

## Troubleshooting
- CORS errors: requests originate from the service worker to `http://127.0.0.1`, which FastAPI already allows. Double-check you did not change the backend URL.
- Mixed content warnings: the extension runs in a secure context; HTTP to localhost is generally permitted. If a network policy blocks it, ask to allowlist `127.0.0.1`.
- Image taint issues: garment downloads happen in the background script as `blob` requests, keeping canvas operations safe.
- Popup blank screen: confirm `npm run build` produced in-place assets (look for `extension/popup/assets/` and ensure `index.html` still references `index.jsx` or generated JS with relative paths).
- Debug background errors: open `chrome://extensions`, click **Inspect views** under the extension, and check the Service Worker console.
- Request failures: open `http://127.0.0.1:8000/docs` to verify the backend is running and reachable.

## Validation Checklist
- [ ] `backend\run.bat` starts the API on `127.0.0.1:8000`.
- [ ] `pwsh .\selftest\try_backend.ps1` produces `out.png`.
- [ ] `build-extension.bat` completes without errors.
- [ ] Loading the unpacked extension shows no warnings in Chrome.
- [ ] The popup can upload a photo and persist it between opens.
- [ ] Right-clicking an image → **试穿此图** produces a composite (new tab or popup).
- [ ] Error paths (missing uploads, network issues) surface clear messages.

## Next Steps
1. Scaffold the FastAPI app, define the `/tryon` endpoint, and add lightweight image compositing.
2. Initialize the Chrome extension manifest, background worker, content script, and context menu hook.
3. Bootstrap the popup React app with Vite, wire it to the backend fetch flow, and package it for the extension.
