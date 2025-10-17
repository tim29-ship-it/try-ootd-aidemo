Enhance ./backend:

1. In app.py:

   - Add error handling: invalid images, missing fields -> 400 JSON with message.
   - Limit image sizes by downscaling if width > 2000 px to avoid memory spikes.
   - Utility function pillow_to_base64(img: Image) -> str.

2. Add test_client.py (optional CLI quick test):

   - Uses requests to POST two local images to /tryon and saves result to out.png.

3. Update README.md:
   - Document run steps, sample curl:
     curl -X POST -F "user_photo=@me.png" -F "garment_img=@shirt.png" http://127.0.0.1:8000/tryon

Acceptance:

- Bad input returns a helpful JSON error.
- With two sample images, out.png is produced and visually shows overlay.
