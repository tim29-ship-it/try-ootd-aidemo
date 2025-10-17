import base64
import pathlib
import sys
from typing import Optional

import requests


def _resolve_path(path: str) -> pathlib.Path:
    candidate = pathlib.Path(path).expanduser().resolve()
    if not candidate.is_file():
        raise FileNotFoundError(f"File not found: {candidate}")
    return candidate


def run(
    user_photo: pathlib.Path,
    garment_img: pathlib.Path,
    endpoint: str = "http://127.0.0.1:8000/tryon",
    output: Optional[pathlib.Path] = None,
) -> pathlib.Path:
    with user_photo.open("rb") as user_handle, garment_img.open("rb") as garment_handle:
        response = requests.post(
            endpoint,
            files={
                "user_photo": (user_photo.name, user_handle, "image/png"),
                "garment_img": (garment_img.name, garment_handle, "image/png"),
            },
            timeout=30,
        )

    if response.status_code != 200:
        raise RuntimeError(f"Request failed: {response.status_code} {response.text}")

    payload = response.json()
    image_b64 = payload.get("image_base64")
    if not image_b64:
        raise RuntimeError("Missing 'image_base64' in response.")

    decoded = base64.b64decode(image_b64)
    out_path = output or pathlib.Path("out.png")
    out_path.write_bytes(decoded)
    return out_path


def main(argv: list[str]) -> int:
    if len(argv) < 3:
        print("Usage: python test_client.py <user_photo> <garment_img> [output]", file=sys.stderr)
        return 1

    user = _resolve_path(argv[1])
    garment = _resolve_path(argv[2])
    output = pathlib.Path(argv[3]).expanduser() if len(argv) >= 4 else None

    try:
        result = run(user, garment, output=output)
    except Exception as exc:  # pylint: disable=broad-exception-caught
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    print(f"Wrote result to {result}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
