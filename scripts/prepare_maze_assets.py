import json
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw

from prepare_walk_cycles import isolate, normalize, select_loop, save_sheet, OUTPUT

ROOT = Path(__file__).resolve().parents[1]
SCENES = ROOT / "src" / "assets" / "scenes"
DEST = ROOT / "src" / "assets" / "maze"


def cutout(image):
    data = np.array(image.convert("RGBA"))
    white = (data[:, :, :3].min(axis=2) >= 235) | (data[:, :, 3] == 0)
    mask = Image.fromarray(np.where(white, 0, 255).astype("uint8")).copy()
    for x in range(image.width):
        for y in (0, image.height - 1):
            if mask.getpixel((x, y)) == 0:
                ImageDraw.floodfill(mask, (x, y), 128)
    for y in range(image.height):
        for x in (0, image.width - 1):
            if mask.getpixel((x, y)) == 0:
                ImageDraw.floodfill(mask, (x, y), 128)
    data[np.array(mask) == 128] = 0
    if not np.any(data[:, :, 3] == 0):
        raise ValueError("Background removal produced no transparent pixels")
    result = Image.fromarray(data)
    bounds = result.getbbox()
    if bounds is None:
        raise ValueError("No foreground found")
    return result.crop(bounds)

def prepare_cutouts():
    for source, count, prefix in [("MazeGame-StudetnsStanding1", 4, "student"),
                                  ("MazeGame-StudetnsStanding2", 4, "student-alt"),
                                  ("MazeGame-StudentsOnBenches", 3, "bench")]:
        image = Image.open(SCENES / f"{source}.png")
        boundaries = [round(value * image.width / 1024) for value in [0, 290, 507, 735, 1024]] if prefix == "student" else (
            [round(value * image.width / 1024) for value in [0, 352, 660, 1024]] if prefix == "bench" else
            [index * image.width // count for index in range(count + 1)]
        )
        for index in range(count):
            crop = image.crop((boundaries[index], 0, boundaries[index + 1], image.height))
            cutout(crop).save(DEST / f"{prefix}-{index}.png")
    for source, name in [("MazeGame-StudentsInLine", "line"), ("MazeGame-PalmTree", "palm")]:
        cutout(Image.open(SCENES / f"{source}.png")).save(DEST / f"{name}.png")


def prepare_masks():
    sections = {}
    for letter in "ABCDEFGHI":
        art = Image.open(SCENES / f"MazeGame-{letter}.png")
        guide = Image.open(SCENES / f"MazeGame-{letter}-Walkable.png").convert("RGB")
        if art.size != guide.size:
            raise ValueError(f"{letter}: guide dimensions differ")
        width, height = (value // 2 for value in art.size)
        rgb = np.asarray(guide.resize((width, height), Image.Resampling.NEAREST))
        red = (rgb[:, :, 0] > 220) & (rgb[:, :, 1] < 50) & (rgb[:, :, 2] < 50)
        radius = 3
        padded = np.pad(red, radius, constant_values=False)
        safe = red.copy()
        for dy in range(-radius, radius + 1):
            for dx in range(-radius, radius + 1):
                if dx * dx + dy * dy <= radius * radius:
                    safe &= padded[radius + dy:radius + dy + height, radius + dx:radius + dx + width]
        rows = [np.flatnonzero(np.diff(np.pad(row.astype(np.int8), 1))).tolist() for row in safe]
        if not safe.any():
            raise ValueError(f"{letter}: no walkable area")
        sections[letter] = {"width": width, "height": height, "rows": rows}
        print(letter, width, height, int(safe.sum()), flush=True)
    (ROOT / "src" / "mazeWalkable.json").write_text(json.dumps(sections, separators=(",", ":")) + "\n")


def prepare_people():
    manifest_path = OUTPUT / "manifest.json"
    manifest = json.loads(manifest_path.read_text())
    character = {"idle": {}, "walk": {}}
    for direction, asset in [("up", "back"), ("down", "front"), ("side", "side")]:
        reader = imageio_ffmpeg.read_frames(str(SCENES / f"peter-walking-{asset}.mp4"),
                                          pix_fmt="rgb24", output_params=["-vf", "fps=24,scale=224:400"])
        next(reader)
        frames = [isolate(Image.frombytes("RGB", (224, 400), frame), "peter") for frame in reader]
        character["walk"][direction] = save_sheet(select_loop(normalize(frames, mirror=direction == "side", target_height=194)),
                                                f"peter-walk-{direction}.png")
    for direction, asset in [("up", "back"), ("down", "front"), ("left", "side"), ("right", "side")]:
        frames = normalize([isolate(Image.open(SCENES / f"peter-{asset}.png"), "peter")],
                           mirror=direction == "right", target_height=194)
        character["idle"][direction] = save_sheet(frames, f"peter-idle-{direction}.png")
    manifest["peter"] = character
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    prepare_cutouts()


if __name__ == "__main__":
    DEST.mkdir(exist_ok=True)
    prepare_masks()
    prepare_people()
