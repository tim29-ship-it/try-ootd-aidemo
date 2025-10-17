const MENU_ID = "tryon-this-image";
let lastImgSrc = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "\u8bd5\u7a7f\u6b64\u56fe",
    contexts: ["image"],
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !message.type) {
    sendResponse?.({ error: "Unsupported message." });
    return;
  }

  if (message.type === "SET_LAST_IMG") {
    lastImgSrc = typeof message.src === "string" ? message.src : null;
    sendResponse?.({ ok: true });
    return;
  }

  if (message.type === "TRY_ON_FROM_PAGE") {
    handleTryOn()
      .then((result) => sendResponse?.(result))
      .catch((error) => sendResponse?.({ error: error.message || String(error) }));
    return true;
  }

  sendResponse?.({ error: "Unsupported message." });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== MENU_ID) {
    return;
  }

  if (!info.srcUrl) {
    return;
  }

  lastImgSrc = info.srcUrl;

  handleTryOn()
    .then((result) => {
      if (result?.image_base64) {
        chrome.tabs.create({
          url: `data:image/png;base64,${result.image_base64}`,
        });
      } else if (result?.error) {
        console.warn("TryOn error:", result.error);
      }
    })
    .catch((error) => {
      console.error("TryOn failed:", error);
    });
});

async function handleTryOn() {
  if (!lastImgSrc) {
    return { error: "\u672a\u627e\u5230\u53ef\u7528\u7684\u670d\u88c5\u56fe\u7247, \u8bf7\u91cd\u65b0\u9009\u62e9." };
  }

  let stored;
  try {
    stored = await chrome.storage.local.get(["userPhoto", "userPhotoName", "userPhotoType"]);
  } catch (error) {
    return { error: `\u8bfb\u53d6\u5b58\u50a8\u5931\u8d25: ${error.message || error}` };
  }

  const userPhotoPayload = stored.userPhoto;
  const userPhotoName = stored.userPhotoName || "user_photo.png";

  if (!userPhotoPayload) {
    return { error: "\u8bf7\u5148\u5728\u63d2\u4ef6\u5f39\u7a97\u4e0a\u4f20\u672c\u4eba\u7167\u7247." };
  }

  let userBlob;
  try {
    userBlob = storedPhotoToBlob(userPhotoPayload, stored.userPhotoType);
  } catch (error) {
    return { error: `\u5904\u7406\u672c\u5730\u7167\u7247\u5931\u8d25: ${error.message || error}` };
  }

  let garmentBlob;
  try {
    const garmentResponse = await fetch(lastImgSrc, { credentials: "omit" });
    if (!garmentResponse.ok) {
      throw new Error(`\u7f51\u7edc\u8bf7\u6c42\u5931\u8d25: ${garmentResponse.status}`);
    }
    garmentBlob = await garmentResponse.blob();
  } catch (error) {
    return { error: `\u4e0b\u8f7d\u670d\u88c5\u56fe\u7247\u5931\u8d25: ${error.message || error}` };
  }

  const formData = new FormData();
  formData.append("user_photo", userBlob, userPhotoName);
  formData.append("garment_img", garmentBlob, "garment.png");

  try {
    const response = await fetch("http://127.0.0.1:8000/tryon", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();
    if (!response.ok) {
      return { error: payload?.message || "\u540e\u53f0\u670d\u52a1\u8fd4\u56de\u9519\u8bef." };
    }

    if (!payload?.image_base64) {
      return { error: "\u540e\u53f0\u54cd\u5e94\u7f3a\u5c11\u56fe\u7247\u6570\u636e." };
    }

    return { image_base64: payload.image_base64 };
  } catch (error) {
    return { error: `\u8bf7\u6c42\u540e\u53f0\u5931\u8d25: ${error.message || error}` };
  }
}

function dataUrlToBlob(dataUrl) {
  const match = /^data:(.*?);base64,(.*)$/.exec(dataUrl);
  if (!match) {
    throw new Error("\u65e0\u6548\u7684 Data URL.");
  }
  const mime = match[1] || "image/png";
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

function storedPhotoToBlob(payload, mimeType) {
  if (typeof payload === "string") {
    return dataUrlToBlob(payload);
  }

  if (Array.isArray(payload)) {
    const bytes = Uint8Array.from(payload);
    return new Blob([bytes], { type: mimeType || "image/png" });
  }

  throw new Error("\u65e0\u6548\u7684\u7167\u7247\u6570\u636e\u683c\u5f0f.");
}
