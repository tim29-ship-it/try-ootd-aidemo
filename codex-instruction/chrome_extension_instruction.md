Inside ./extension create:

1. manifest.json (MV3):
   {
   "manifest_version": 3,
   "name": "TryOn Demo",
   "version": "0.1.0",
   "action": { "default_popup": "popup/index.html", "default_title": "TryOn Demo" },
   "permissions": ["activeTab", "scripting", "storage", "contextMenus"],
   "host_permissions": ["<all_urls>"],
   "background": { "service_worker": "service_worker.js" },
   "content_scripts": [{
   "matches": ["<all_urls>"],
   "js": ["content_script.js"],
   "run_at": "document_idle"
   }]
   }

2. service_worker.js:

- OnInstalled: create context menu id "tryon-this-image" with title "试穿此图" and contexts ["image"].
- Keep variable lastImgSrc (string|null).
- onMessage: handle:
  - SET_LAST_IMG {src} -> store into lastImgSrc
  - TRY_ON_FROM_PAGE -> call an async handleTryOn() and respond with {image_base64|error}
- onContextMenusClicked: if id matches and info.srcUrl present -> set lastImgSrc and call handleTryOn(); if result has image_base64 open new tab with data URL.
- handleTryOn():
  - read userPhoto,userPhotoName from chrome.storage.local
  - if missing -> return {error: "...请先在插件弹窗上传本人照片"}
  - fetch garment from lastImgSrc (blob)
  - POST both blobs to http://127.0.0.1:8000/tryon with FormData
  - return JSON or {error}

Acceptance:

- No UI yet, just background and manifest compiled.
- Code is clean; errors are returned as {error: "..."}.
