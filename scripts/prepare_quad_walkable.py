import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SCENES = ROOT / "src" / "assets" / "scenes"


def prepare(section):
    reference = Image.open(SCENES / f"quad-{section}-walkable.png").convert("RGB")
    artwork = Image.open(SCENES / f"quad-{section}.png")
    if reference.size != artwork.size:
        raise ValueError(f"{section}: reference and artwork dimensions differ")
    width, height = (dimension // 2 for dimension in reference.size)
    pixels = np.asarray(reference.resize((width, height), Image.Resampling.NEAREST))
    red = (pixels[:, :, 0] >= 220) & (pixels[:, :, 1] <= 45) & (pixels[:, :, 2] <= 45)
    padded = np.pad(red, 13, constant_values=False)
    safe = red.copy()
    for dy in range(-13, 14):
        for dx in range(-13, 14):
            if dx * dx + dy * dy <= 13 * 13:
                safe &= padded[13 + dy:13 + dy + height, 13 + dx:13 + dx + width]
    rows = []
    for row in safe:
        changes = np.diff(np.pad(row.astype(np.int8), 1))
        rows.append([int(value) for value in np.flatnonzero(changes)])
    occupied = np.flatnonzero(safe.any(axis=1))
    if not occupied.size:
        raise ValueError(f"{section}: no walkable foot positions")
    bottom = int(occupied[-1])
    intervals = list(zip(rows[bottom][::2], rows[bottom][1::2]))
    left, right = max(intervals, key=lambda interval: interval[1] - interval[0])
    start = {"x": (left + right - 1) // 2, "y": bottom}
    print(section, width, height, "start", start, "walkable cells", int(safe.sum()))
    return {"width": width, "height": height, "rows": rows, "start": start}


if __name__ == "__main__":
    sections = {name: prepare(name) for name in ("lowerleft", "upperleft", "lowerright")}
    (ROOT / "src" / "quadWalkable.json").write_text(json.dumps(sections, separators=(",", ":")) + "\n")
