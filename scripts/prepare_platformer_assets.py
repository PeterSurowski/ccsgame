from pathlib import Path

import imageio_ffmpeg
from PIL import Image

from prepare_walk_cycles import isolate

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "src" / "assets" / "platformer"
BOUNDS = [70, 250, 425, 600, 775, 940]
CELL = 96


def place(sheet, source, column, row):
    sprite = isolate(source, "student")
    sprite.thumbnail((70, 88), Image.Resampling.LANCZOS)
    sheet.alpha_composite(sprite, (column * CELL + (CELL - sprite.width) // 2,
                                  row * CELL + 92 - sprite.height))


def prepare():
    DEST.mkdir(exist_ok=True)
    still = Image.open(ROOT / "src" / "sidescroller-students.png")
    idle = Image.new("RGBA", (CELL, CELL * 5))
    for row in range(5):
        place(idle, still.crop((BOUNDS[row], 0, BOUNDS[row + 1], 448)), 0, row)
    idle.save(DEST / "students-idle.png")
    reader = imageio_ffmpeg.read_frames(
        str(ROOT / "src" / "sidescroller-students-walking.mp4"),
        pix_fmt="rgb24", output_params=["-vf", "fps=12"])
    metadata = next(reader)
    if metadata["size"] != (1024, 448):
        raise ValueError(f"Unexpected walking video dimensions: {metadata['size']}")
    frames = list(reader)
    walk = Image.new("RGBA", (CELL * len(frames), CELL * 5))
    for column, frame in enumerate(frames):
        image = Image.frombytes("RGB", (1024, 448), frame)
        for row in range(5):
            place(walk, image.crop((BOUNDS[row], 0, BOUNDS[row + 1], 448)), column, row)
    walk.save(DEST / "students-walking.png")
    print(f"Generated five students, {len(frames)} walking frames each")


if __name__ == "__main__":
    prepare()
