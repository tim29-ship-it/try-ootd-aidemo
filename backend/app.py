import base64
import io
from typing import Optional, Tuple

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image


def _load_rgba(data: bytes, filename: Optional[str]) -> Image.Image:
    """Read raw image bytes into an RGBA Pillow image."""
    try:
        image = Image.open(io.BytesIO(data))
        return image.convert("RGBA")
    except Exception as exc:  # pylint: disable=broad-exception-caught
        label = filename or "uploaded file"
        raise HTTPException(status_code=400, detail=f"Invalid image for '{label}'") from exc


def _downscale_if_needed(image: Image.Image, max_width: int = 2000) -> Image.Image:
    """Clamp images that exceed the maximum width while preserving aspect."""
    width, height = image.size
    if width <= max_width:
        return image

    scale = max_width / float(width)
    scaled_height = max(1, int(height * scale))
    return image.resize((max_width, scaled_height), Image.LANCZOS)


def _compute_resize_dimensions(user_size: Tuple[int, int], garment_size: Tuple[int, int]) -> Tuple[int, int]:
    """Derive a garment size that is ~60% of the user width while keeping aspect ratio."""
    user_width, _ = user_size
    garment_width, garment_height = garment_size

    target_width = max(1, int(user_width * 0.6))
    scale = target_width / max(1, garment_width)
    target_height = max(1, int(garment_height * scale))
    return target_width, target_height


def pillow_to_base64(image: Image.Image) -> str:
    """Encode the provided image as a base64 PNG string."""
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("ascii")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"ok": True}


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"message": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, _exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"message": "Missing or invalid form data."})


@app.post("/tryon")
async def tryon(user_photo: UploadFile = File(...), garment_img: UploadFile = File(...)) -> dict:
    user_bytes = await user_photo.read()
    garment_bytes = await garment_img.read()

    if not user_bytes:
        raise HTTPException(status_code=400, detail="Empty upload for 'user_photo'.")
    if not garment_bytes:
        raise HTTPException(status_code=400, detail="Empty upload for 'garment_img'.")

    user_image = _load_rgba(user_bytes, user_photo.filename)
    garment_image = _load_rgba(garment_bytes, garment_img.filename)

    user_image = _downscale_if_needed(user_image)
    garment_image = _downscale_if_needed(garment_image)

    user_width, user_height = user_image.size
    new_width, new_height = _compute_resize_dimensions(user_image.size, garment_image.size)
    garment_resized = garment_image.resize((new_width, new_height), Image.LANCZOS)

    x_position = max(0, (user_width - new_width) // 2)
    y_position = max(0, int(user_height * 0.25))
    if y_position + new_height > user_height:
        y_position = max(0, user_height - new_height)

    composed = user_image.copy()
    # TODO(try-on): Swap this placeholder compositing with:
    #  - A human parsing upper-body mask (Mediapipe / HF) to segment the torso.
    #  - Thin Plate Spline warping to better fit the garment silhouette.
    #  - Foreground/background layering (hair, arms) to improve realism.
    composed.paste(garment_resized, (x_position, y_position), garment_resized)

    return {"image_base64": pillow_to_base64(composed)}
