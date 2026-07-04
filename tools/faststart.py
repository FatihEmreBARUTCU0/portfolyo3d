"""Move moov atom before mdat for browser-friendly scroll seeking."""

from __future__ import annotations

import struct
import sys
from pathlib import Path


def read_box_header(data: bytes, offset: int) -> tuple[int, bytes, int] | None:
    if offset + 8 > len(data):
        return None

    size = struct.unpack(">I", data[offset : offset + 4])[0]
    box_type = data[offset + 4 : offset + 8]

    header_size = 8
    if size == 1:
        if offset + 16 > len(data):
            return None
        size = struct.unpack(">Q", data[offset + 8 : offset + 16])[0]
        header_size = 16
    elif size == 0:
        size = len(data) - offset

    if size < header_size or offset + size > len(data):
        return None

    return size, box_type, header_size


def split_boxes(data: bytes) -> list[tuple[bytes, bytes]]:
    boxes: list[tuple[bytes, bytes]] = []
    offset = 0

    while offset < len(data):
        parsed = read_box_header(data, offset)
        if not parsed:
            break

        size, box_type, header_size = parsed
        boxes.append((box_type, data[offset : offset + size]))
        offset += size

    return boxes


def faststart(src: Path, dst: Path) -> None:
    data = src.read_bytes()
    boxes = split_boxes(data)

    by_type: dict[bytes, list[bytes]] = {}
    for box_type, box in boxes:
        by_type.setdefault(box_type, []).append(box)

    if b"moov" not in by_type or b"mdat" not in by_type:
        raise ValueError("Input is not a supported MP4 (missing moov or mdat).")

    moov_index = next(i for i, (t, _) in enumerate(boxes) if t == b"moov")
    mdat_index = next(i for i, (t, _) in enumerate(boxes) if t == b"mdat")

    if moov_index < mdat_index:
        dst.write_bytes(data)
        return

    ordered: list[bytes] = []
    for box_type, box in boxes:
        if box_type in (b"moov", b"mdat"):
            continue
        ordered.append(box)

    insert_at = 0
    for i, box in enumerate(ordered):
        if box[4:8] == b"ftyp":
            insert_at = i + 1
            break

    moov_boxes = by_type[b"moov"]
    mdat_boxes = by_type[b"mdat"]
    ordered[insert_at:insert_at] = moov_boxes + mdat_boxes

    dst.write_bytes(b"".join(ordered))


if __name__ == "__main__":
    source = Path(sys.argv[1] if len(sys.argv) > 1 else "../assets/hero.mp4")
    target = Path(sys.argv[2] if len(sys.argv) > 2 else "../assets/hero-faststart.mp4")
    faststart(source.resolve(), target.resolve())
    print(f"Wrote {target}")
