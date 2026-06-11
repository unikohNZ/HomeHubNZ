import struct
import zlib
from pathlib import Path

ASSETS_DIR = Path(__file__).resolve().parent.parent / "assets"


def create_png(width: int, height: int, r: int, g: int, b: int) -> bytes:
    def chunk(tag: bytes, data: bytes) -> bytes:
        c = tag + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    raw = b"".join(b"\x00" + bytes([r, g, b] * width) for _ in range(height))
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw))
        + chunk(b"IEND", b"")
    )


def main() -> None:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    for name, size in [
        ("icon.png", 1024),
        ("splash.png", 1024),
        ("adaptive-icon.png", 1024),
        ("notification-icon.png", 96),
    ]:
        (ASSETS_DIR / name).write_bytes(create_png(size, size, 59, 130, 246))
    print("Assets created in", ASSETS_DIR)


if __name__ == "__main__":
    main()
