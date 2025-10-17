Create ./selftest/try_backend.ps1 (PowerShell):

- Downloads two sample images (or uses existing ./samples/me.png and ./samples/garment.png).
- Calls backend POST /tryon with Invoke-RestMethod and writes out out.png from returned base64.

Acceptance:

- `pwsh .\selftest\try_backend.ps1` produces out.png if backend running.
