console.log("[TryOn] content_script loaded", chrome.runtime.id)
const HOVER_CLASS = "__tryon-hover-img"

const styleEl = document.createElement("style")
styleEl.textContent = `
.${HOVER_CLASS} {
  outline: 2px solid #4a90e2 !important;
  cursor: pointer !important;
}
`
document.documentElement.appendChild(styleEl)

let currentImg = null

function handleMouseOver (event) {
  const target = event.target
  if (!(target instanceof HTMLImageElement)) {
    return
  }

  if (currentImg && currentImg !== target) {
    currentImg.classList.remove(HOVER_CLASS)
  }

  currentImg = target
  target.classList.add(HOVER_CLASS)
}

function handleMouseOut (event) {
  const target = event.target
  if (target instanceof HTMLImageElement) {
    target.classList.remove(HOVER_CLASS)
    if (currentImg === target) {
      currentImg = null
    }
  }
}

function handleContextMenu (event) {
  const target = event.target
  if (!(target instanceof HTMLImageElement) || !target.src) {
    return
  }

  chrome.runtime.sendMessage({
    type: "SET_LAST_IMG",
    src: target.src,
  })
}

document.addEventListener("mouseover", handleMouseOver, true)
document.addEventListener("mouseout", handleMouseOut, true)
document.addEventListener("contextmenu", handleContextMenu, true)
