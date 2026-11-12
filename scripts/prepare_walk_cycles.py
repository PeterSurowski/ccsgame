import json
from collections import deque
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageOps


ROOT = Path(__file__).resolve().parents[1] / "src" / "assets" / "sprites" / "sprites-susan"
OUTPUT = ROOT.parent / "animated"
OUTPUT.mkdir(exist_ok=True)
CELL = (112, 224)


def isolate(image, name):
    image = image.convert("RGBA")
    data = np.array(image)
    rgb = data[:, :, :3].astype(int)
    background = (rgb.min(axis=2) >= 235) | (data[:, :, 3] == 0)
    if name == "chad":
        neutral = (rgb.max(axis=2) - rgb.min(axis=2) < 25) & (rgb.min(axis=2) > 130)
        neutral[: int(image.height * .65)] = False
        background |= neutral
    mask = Image.fromarray(np.where(background, 0, 255).astype("uint8")).copy()
    # Only remove background connected to the canvas border.
    for x in range(image.width):
        for y in (0, image.height - 1):
            if mask.getpixel((x, y)) == 0:
                ImageDraw.floodfill(mask, (x, y), 128)
    for y in range(image.height):
        for x in (0, image.width - 1):
            if mask.getpixel((x, y)) == 0:
                ImageDraw.floodfill(mask, (x, y), 128)
    removed = np.array(mask) == 128
    data[removed] = 0
    # Keep the largest silhouette, discarding isolated compression specks.
    solid = data[:, :, 3] > 20
    remaining = set(zip(*np.nonzero(solid)))
    largest = set()
    while remaining:
        seed = remaining.pop()
        component = {seed}
        queue = deque([seed])
        while queue:
            y, x = queue.popleft()
            for neighbor in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if neighbor in remaining:
                    remaining.remove(neighbor)
                    component.add(neighbor)
                    queue.append(neighbor)
        if len(component) > len(largest):
            largest = component
    if not largest:
        raise ValueError(f"No character silhouette found for {name}")
    keep = np.zeros(solid.shape, dtype=bool)
    yy, xx = zip(*largest)
    keep[yy, xx] = True
    data[~keep] = 0
    result = Image.fromarray(data)
    return result.crop(result.getbbox())


def normalize(images, mirror=False, target_height=200):
    scale = target_height / float(np.median([image.height for image in images]))
    result = []
    for image in images:
        if mirror:
            image = ImageOps.mirror(image)
        size = (round(image.width * scale), round(image.height * scale))
        if size[0] > CELL[0] or size[1] > 212:
            raise ValueError(f"Sprite exceeds shared canvas: {size}")
        image = image.resize(size, Image.Resampling.LANCZOS)
        cell = Image.new("RGBA", CELL)
        cell.alpha_composite(image, ((CELL[0] - size[0]) // 2, 212 - size[1]))
        result.append(cell)
    return result


def select_loop(frames):
    # Find matching poses at least half a second apart, avoiding the initial still.
    poses = [np.asarray(frame.resize((28, 56)), dtype=float) / 255 for frame in frames]
    candidates = []
    for start in range(2, len(frames) - 15):
        for end in range(start + 15, min(start + 37, len(frames))):
            difference = float(np.mean((poses[start] - poses[end]) ** 2))
            candidates.append((difference, start, end))
    difference, start, end = min(candidates)
    print(f"  loop: {start}:{end}, {end - start} frames, seam error {difference:.5f}")
    return frames[start:end]


def save_sheet(frames, filename):
    columns = min(8, len(frames))
    sheet = Image.new("RGBA", (columns * CELL[0], ((len(frames) + columns - 1) // columns) * CELL[1]))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, (index % columns * CELL[0], index // columns * CELL[1]))
    sheet.save(OUTPUT / filename, optimize=True)
    return {"file": filename, "frames": len(frames), "columns": columns, "fps": 24}


if __name__ == "__main__":
    manifest = {}
    for name, folder, mirror_side in [("susan", ROOT, False), ("chad", ROOT / "sprites-chad", True)]:
        character = {"idle": {}, "walk": {}}
        for direction, asset in [("up", "back"), ("down", "front"), ("side", "side")]:
            path = folder / f"{name}-walking-{asset}.mp4"
            print(path.name, flush=True)
            reader = imageio_ffmpeg.read_frames(str(path), pix_fmt="rgb24", output_params=["-vf", "fps=24,scale=224:400"])
            metadata = next(reader)
            frames = [isolate(Image.frombytes("RGB", (224, 400), frame), name) for frame in reader]
            frames = select_loop(normalize(frames, mirror=direction == "side" and mirror_side))
            character["walk"][direction] = save_sheet(frames, f"{name}-walk-{direction}.png")
        idle_assets = {"up": "back", "down": "front", "left": "left", "right": "right"} if name == "susan" else {
            "up": "back", "down": "front", "left": "side", "right": "side",
        }
        for direction, asset in idle_assets.items():
            image = Image.open(folder / f"{name}-idle-{asset}.png")
            frames = normalize([isolate(image, name)], mirror=name == "chad" and direction == "right")
            character["idle"][direction] = save_sheet(frames, f"{name}-idle-{direction}.png")
        manifest[name] = character

    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print("Generated both characters' transparent, foot-aligned sprite sheets.")
