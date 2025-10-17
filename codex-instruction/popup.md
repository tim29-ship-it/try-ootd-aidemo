Inside ./extension/popup scaffold a minimal Vite+React app that builds to this same folder (no dev server needed, we will open index.html as extension popup):

Files:

- package.json with scripts:
  "build": "vite build",
  "dev": "vite"
- vite.config.js configured to output to current folder (dist overwriting index.html, index.jsx -> keep as source; simplest is to treat popup/ as project root and emit to popup/).
- index.html containing <div id="root"></div> and script type="module" src="index.jsx".
- index.jsx:
  - React app with:
    - file input to upload user photo
    - button “试穿” that sends message {type:"TRY_ON_FROM_PAGE"} to background
    - if response has image_base64, show <img> result
  - On upload: store binary into chrome.storage.local as Uint8Array plus name.

Acceptance:

- `npm i` then `npm run build` inside ./extension/popup produces static assets that still work as an extension popup.
- Popup shows upload + button; clicking tries background flow.
