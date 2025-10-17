import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

function storageGet(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(result);
    });
  });
}

function storageSet(items) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

function App() {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [resultImage, setResultImage] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const previewMetaRef = useRef({ url: null, revoke: false });
  const resultMetaRef = useRef({ url: null, revoke: false });

  const updatePreview = useCallback((url, shouldRevoke) => {
    const previous = previewMetaRef.current;
    if (previous.revoke && previous.url) {
      URL.revokeObjectURL(previous.url);
    }
    previewMetaRef.current = { url, revoke: shouldRevoke };
    setPhotoPreview(url);
  }, []);

  const updateResult = useCallback((url, shouldRevoke) => {
    const previous = resultMetaRef.current;
    if (previous.revoke && previous.url) {
      URL.revokeObjectURL(previous.url);
    }
    resultMetaRef.current = { url, revoke: shouldRevoke };
    setResultImage(url);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await storageGet(["userPhoto", "userPhotoName", "userPhotoType"]);

        if (!mounted) {
          return;
        }

        setPhotoName(stored.userPhotoName || "");
        const payload = stored.userPhoto;
        if (!payload) {
          return;
        }

        if (typeof payload === "string") {
          updatePreview(payload, false);
          return;
        }

        if (Array.isArray(payload)) {
          const blob = new Blob([Uint8Array.from(payload)], {
            type: stored.userPhotoType || "image/png",
          });
          updatePreview(URL.createObjectURL(blob), true);
        }
      } catch (err) {
        console.error("Failed to load stored photo", err);
      }
    })();

    return () => {
      mounted = false;
      const previewMeta = previewMetaRef.current;
      if (previewMeta.revoke && previewMeta.url) {
        URL.revokeObjectURL(previewMeta.url);
      }
      const resultMeta = resultMetaRef.current;
      if (resultMeta.revoke && resultMeta.url) {
        URL.revokeObjectURL(resultMeta.url);
      }
    };
  }, [updatePreview]);

  const handleFileChange = useCallback(
    async (event) => {
      const { files } = event.target;
      const file = files && files[0];
      if (!file) {
        return;
      }

      setStatus("\u6b63\u5728\u4fdd\u5b58\u7167\u7247...");
      setError("");
      try {
        const buffer = await file.arrayBuffer();
        const bytes = Array.from(new Uint8Array(buffer));
        await storageSet({
          userPhoto: bytes,
          userPhotoName: file.name,
          userPhotoType: file.type || "image/png",
        });
        setPhotoName(file.name);
        updatePreview(URL.createObjectURL(file), true);
        setStatus("\u7167\u7247\u5df2\u4fdd\u5b58, \u53ef\u53f3\u952e\u9009\u62e9\u670d\u88c5\u56fe.");
      } catch (err) {
        console.error("Failed to store photo", err);
        setError("\u4fdd\u5b58\u7167\u7247\u5931\u8d25, \u8bf7\u91cd\u8bd5.");
      }
    },
    [updatePreview],
  );

  const handleTryOn = useCallback(() => {
    setIsLoading(true);
    setStatus("\u6b63\u5728\u8bf7\u6c42\u8bd5\u7a7f\u7ed3\u679c...");
    setError("");

    chrome.runtime.sendMessage({ type: "TRY_ON_FROM_PAGE" }, (response) => {
      setIsLoading(false);
      if (chrome.runtime.lastError) {
        setError(chrome.runtime.lastError.message || "Unable to reach background.");
        setStatus("");
        return;
      }

      if (!response) {
        setError("\u540e\u53f0\u6ca1\u6709\u8fd4\u56de\u6570\u636e.");
        setStatus("");
        return;
      }

      if (response.error) {
        setError(response.error);
        setStatus("");
        return;
      }

      if (response.image_base64) {
        updateResult(`data:image/png;base64,${response.image_base64}`, false);
        setStatus("\u751f\u6210\u6210\u529f!");
      } else {
        setError("\u54cd\u5e94\u7f3a\u5c11\u751f\u6210\u7ed3\u679c.");
        setStatus("");
      }
    });
  }, [updateResult]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>\u8bd5\u7a7f\u52a9\u624b</h1>

      <label style={styles.label}>
        \u4e0a\u4f20\u672c\u4eba\u7167\u7247
        <input type="file" accept="image/*" onChange={handleFileChange} style={styles.fileInput} />
      </label>
      {photoName ? <p style={styles.note}>\u5df2\u9009\u62e9: {photoName}</p> : null}
      {photoPreview ? (
        <img src={photoPreview} alt="\u7528\u6237\u7167\u7247\u9884\u89c8" style={styles.preview} />
      ) : (
        <p style={styles.placeholder}>\u5c1a\u672a\u4e0a\u4f20\u7167\u7247</p>
      )}

      <button type="button" onClick={handleTryOn} style={styles.button} disabled={isLoading}>
        {isLoading ? "\u5904\u7406\u4e2d..." : "\u8bd5\u7a7f"}
      </button>

      {status ? <p style={styles.status}>{status}</p> : null}
      {error ? <p style={styles.error}>{error}</p> : null}

      {resultImage ? (
        <>
          <h2 style={styles.subtitle}>\u8bd5\u7a7f\u7ed3\u679c</h2>
          <img src={resultImage} alt="\u8bd5\u7a7f\u6548\u679c" style={styles.result} />
        </>
      ) : null}
    </div>
  );
}

const styles = {
  container: {
    width: 320,
    padding: 16,
    fontFamily: "system-ui, sans-serif",
    color: "#1f2933",
  },
  title: {
    fontSize: 18,
    margin: "0 0 12px",
  },
  subtitle: {
    fontSize: 16,
    margin: "16px 0 8px",
  },
  label: {
    display: "block",
    fontWeight: 600,
    marginBottom: 8,
  },
  fileInput: {
    display: "block",
    marginTop: 6,
  },
  note: {
    margin: "6px 0",
    fontSize: 12,
    color: "#52606d",
  },
  placeholder: {
    margin: "8px 0",
    fontSize: 12,
    color: "#9aa5b1",
  },
  preview: {
    width: "100%",
    height: "auto",
    borderRadius: 6,
    border: "1px solid #cbd2d9",
    marginBottom: 12,
  },
  button: {
    width: "100%",
    padding: "10px 0",
    backgroundColor: "#4a90e2",
    color: "#fff",
    fontWeight: 600,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  status: {
    marginTop: 8,
    fontSize: 12,
    color: "#316c2c",
  },
  error: {
    marginTop: 8,
    fontSize: 12,
    color: "#c81e1e",
  },
  result: {
    width: "100%",
    height: "auto",
    borderRadius: 6,
    border: "1px solid #cbd2d9",
    marginBottom: 12,
  },
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
