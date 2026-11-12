import json
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "assets" / "scenes"
DEST = ROOT / "src" / "assets" / "chase"


def remove_background(image, threshold):
    data = np.array(image.convert("RGBA"))
    rgb = data[:, :, :3].astype(int)
    background = (rgb.min(axis=2) >= threshold) & (
        rgb.max(axis=2) - rgb.min(axis=2) < 30)
    mask = Image.fromarray(np.where(background, 0, 255).astype("uint8")).copy()
    for x in range(image.width):
        for y in (0, image.height - 1):
            if mask.getpixel((x, y)) == 0:
                ImageDraw.floodfill(mask, (x, y), 128)
    for y in range(image.height):
        for x in (0, image.width - 1):
            if mask.getpixel((x, y)) == 0:
                ImageDraw.floodfill(mask, (x, y), 128)
    data[np.array(mask) == 128] = 0
    return Image.fromarray(data)


def prepare():
    DEST.mkdir(exist_ok=True)
    manifest = {}
    for name, size, cell, threshold in [
        ("PeterRunning", (180, 320), (128, 160), 225),
        ("SusanRunning", (180, 320), (96, 160), 125),
        ("studentHorde", (480, 270), (384, 208), 180),
    ]:
        reader = imageio_ffmpeg.read_frames(
            str(SOURCE / f"CCSGame-{name}.mp4"), pix_fmt="rgb24",
            output_params=["-vf", f"fps=12,scale={size[0]}:{size[1]}"])
        metadata = next(reader)
        if metadata["size"] != size:
            raise ValueError(f"Unexpected {name} frame dimensions")
        frames = [remove_background(Image.frombytes("RGB", size, raw), threshold)
                  for raw in reader]
        if not frames:
            raise ValueError(f"No frames decoded for {name}")
        bounds = [image.getbbox() for image in frames]
        if any(box is None for box in bounds):
            raise ValueError(f"Empty character frame for {name}")
        box = (min(b[0] for b in bounds), min(b[1] for b in bounds),
               max(b[2] for b in bounds), max(b[3] for b in bounds))
        scale = min((cell[0] - 4) / (box[2] - box[0]),
                    (cell[1] - 4) / (box[3] - box[1]))
        target = (round((box[2] - box[0]) * scale),
                  round((box[3] - box[1]) * scale))
        columns = 8
        sheet = Image.new("RGBA", (cell[0] * columns,
                                  cell[1] * ((len(frames) + columns - 1) // columns)))
        for index, image in enumerate(frames):
            sprite = image.crop(box).resize(target, Image.Resampling.LANCZOS)
            sheet.alpha_composite(sprite, (
                index % columns * cell[0] + (cell[0] - target[0]) // 2,
                index // columns * cell[1] + cell[1] - target[1]))
        sheet.save(DEST / f"{name}.webp", quality=90, method=6)
        manifest[name] = dict(frames=len(frames), columns=columns, fps=12,
                              width=cell[0], height=cell[1])
        print(f"{name}: {len(frames)} transparent frames", flush=True)

    image = Image.open(SOURCE / "CCSGame-PeterFallen.webp").convert("RGBA")
    # Trace the supplied illustration so its outdoor ground does not rotate with Peter.
    outline = [
        (26, 390), (76, 329), (205, 279), (207, 240), (278, 222),
        (318, 239), (338, 320), (379, 374), (543, 421), (598, 410),
        (640, 369), (608, 282), (554, 248), (550, 216), (575, 197),
        (603, 126), (655, 83), (698, 88), (737, 123), (726, 173),
        (780, 230), (857, 298), (947, 325), (1083, 372), (1124, 351),
        (1160, 266), (1260, 205), (1383, 177), (1506, 198),
        (1565, 245), (1602, 304), (1586, 366), (1538, 390),
        (1572, 434), (1619, 477), (1627, 507), (1694, 529),
        (1741, 567), (1757, 610), (1810, 635), (1841, 676),
        (1890, 697), (1906, 735), (1883, 741), (1901, 772),
        (1878, 778), (1868, 801), (1834, 803), (1799, 780),
        (1770, 745), (1730, 730), (1728, 782), (1692, 799),
        (1664, 769), (1656, 712), (1628, 690), (1572, 737),
        (1495, 800), (1444, 835), (1493, 896), (1562, 919),
        (1704, 930), (1813, 964), (1867, 1002), (1877, 1060),
        (1844, 1085), (1761, 1096), (1614, 1138), (1517, 1137),
        (1475, 1112), (1395, 1128), (1281, 1153), (1230, 1135),
        (1275, 1104), (1380, 1094), (1427, 1068), (1470, 1064),
        (1572, 1085), (1727, 1059), (1785, 1024), (1658, 995),
        (1500, 1000), (1410, 961), (1356, 883), (1255, 897),
        (1123, 940), (1010, 980), (958, 968), (1018, 943),
        (1106, 890), (1000, 899), (900, 902), (835, 856),
        (663, 877), (508, 941), (511, 1018), (482, 1070),
        (478, 1143), (449, 1167), (416, 1150), (386, 1170),
        (353, 1167), (307, 1160), (270, 1146), (234, 1143),
        (177, 1152), (156, 1135), (191, 1097), (207, 1064),
        (180, 1056), (188, 1031), (255, 1008), (314, 965),
        (331, 930), (383, 911), (427, 879), (488, 823),
        (555, 718), (610, 630), (567, 578), (425, 553),
        (309, 520), (205, 483), (125, 475), (51, 429),
    ]
    mask = Image.new("L", image.size)
    ImageDraw.Draw(mask).polygon(outline, fill=255)
    image.putalpha(mask)
    image.thumbnail((360, 240), Image.Resampling.LANCZOS)
    image.save(DEST / "PeterFallen.png")
    (DEST / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")


if __name__ == "__main__":
    prepare()
