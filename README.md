# Try OOTD AI Demo

## Layout
- `backend/`: FastAPI service exposing `POST /tryon`, backed by an HR-VITON-style pipeline with graceful fallbacks.
- `extension/`: Chrome extension shell (Manifest V3) containing the service worker, content script, and context menu wiring.
- `popup/`: Vite + React UI hosted inside the extension popup that sends requests to the backend.

## Backend Setup (HR-VITON)
1. From the repository root run `backend\run.bat`. The script creates `backend\myenv`, installs Python dependencies (PyTorch CPU build by default), and launches FastAPI on `http://127.0.0.1:8000`.
2. Download HR-VITON checkpoints into `backend\models\weights\`. Follow the instructions in [backend/models/weights/README.md](backend/models/weights/README.md) or attempt the helper script:
   ```powershell
   python backend\models\weights\fetch_weights.py
   ```
   > The helper script relies on public release URLs; if a file reports `404`, download it manually using the sources listed in the weights README (e.g., Google Drive links maintained by the HR-VITON project).
3. Optional: set `HR_VITON_DEVICE=cuda` before running `run.bat` to target a compatible GPU; otherwise the pipeline runs on CPU.
4. Validate the service end-to-end:
   ```powershell
   pwsh .\selftest\try_backend.ps1
   ```
   The script fetches sample assets, calls `/tryon`, and writes `out.png`.

### Example API Call
```bash
curl -X POST "http://127.0.0.1:8000/tryon" \
  -F "user_photo=@me.png" \
  -F "garment_img=@shirt.png" \
  -o out.png
```
> The backend logs a warning when it falls back to heuristic compositing (e.g., missing weights). Check the console output from `run.bat` for details.

## Build the Extension Popup
1. Run `build-extension.bat` at the repo root, **or**:
   ```bash
   cd extension/popup
   npm install
   npm run build
   ```
2. The build writes assets in place so `extension/popup/index.html` stays as the popup entry point.

## Load the Extension (Chrome)
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer Mode**.
3. Click **Load unpacked** and choose the `extension` directory.
4. Confirm the extension appears (add your own screenshot placeholder here).

## End-to-End Try-On Test
1. Start the backend (`backend\run.bat`).
2. In the popup, upload a personal photo (screenshot placeholder).
3. Browse any shopping site, right-click a product image, and choose **试穿此图**.
4. The rendered result opens in a new tab or inside the popup preview (add screenshot).

## Troubleshooting
- CORS errors: requests originate from the service worker to `http://127.0.0.1`, which FastAPI allows by default.
- Mixed content warnings: ensure localhost HTTP traffic is permitted in your environment.
- Image taint/canvas issues: garments download in the background script as `blob` requests, keeping canvases safe.
- Popup blank screen: verify `npm run build` produced assets under `extension/popup/assets/`.
- Backend failures: inspect `http://127.0.0.1:8000/docs` and the terminal logs for HR-VITON warnings (e.g., missing weights).

## Validation Checklist
- [ ] `backend\run.bat` starts the API on `127.0.0.1:8000`.
- [ ] `pwsh .\selftest\try_backend.ps1` produces `out.png` and `/health` reports the expected device/weights path.
- [ ] `build-extension.bat` completes without errors.
- [ ] Loading the unpacked extension in Chrome shows no warnings.
- [ ] The popup can upload a photo and persist it between opens.
- [ ] Right-clicking an image → **试穿此图** produces a composite (new tab or popup).
- [ ] User-facing errors for missing uploads or network issues remain descriptive.

## Next Steps
1. Integrate the official HR-VITON neural network definitions under `backend/hr_viton/models.py` to leverage downloaded checkpoints fully.
2. Polish the Chrome extension UI/UX and add result history or feedback.
3. Add automated tests covering the HR-VITON pipeline once real models are wired in.
