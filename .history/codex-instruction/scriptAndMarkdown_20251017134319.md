Add at repository root:

1. build-extension.bat

   - cd extension/popup
   - npm install
   - npm run build
   - echo Build done

2. Update README.md with:
   - How to build popup
   - How to load unpacked extension (chrome://extensions → Developer Mode → Load unpacked → select ./extension)
   - How to test: start backend, open any shopping site image, right-click "试穿此图", see result in new tab or in popup.

Acceptance:

- Running the .bat builds popup assets successfully.
- README has step-by-step with screenshots placeholders.
