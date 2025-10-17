Create ./extension/content_script.js:

- Add hover outline for <img> elements (2px solid #4a90e2); remove on mouseout.
- On contextmenu over an <img>, send {type:"SET_LAST_IMG", src: e.target.src} to the background.

Acceptance:

- When extension loaded unpacked, images highlight on hover.
- Right-clicking an image causes background to remember its src.
