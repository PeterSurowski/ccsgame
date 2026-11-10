from collections import deque
from pathlib import Path

from PIL import Image


source = Path(__file__).resolve().parents[1] / "src" / "assets" / "sprites" / "sprites-susan"
destination = source / "prepared"
destination.mkdir(exist_ok=True)

for path in sorted(source.glob("*.png")):
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    width, height = image.size
    visited = set()
    queue = deque(
        [(x, y) for x in range(width) for y in (0, height - 1)]
        + [(x, y) for y in range(height) for x in (0, width - 1)]
    )
    while queue:
        x, y = queue.popleft()
        if (x, y) in visited or not (0 <= x < width and 0 <= y < height):
            continue
        visited.add((x, y))
        red, green, blue, alpha = pixels[x, y]
        if alpha == 0 or min(red, green, blue) >= 235:
            pixels[x, y] = (0, 0, 0, 0)
            queue.extend([(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)])

    # Remove the white matte from boundary antialiasing, not enclosed highlights.
    for x, y in visited:
        red, green, blue, alpha = pixels[x, y]
        minimum = min(red, green, blue)
        if alpha and minimum >= 180:
            coverage = (255 - minimum) / 75
            channels = tuple(round((channel - 255 * (1 - coverage)) / coverage) for channel in (red, green, blue))
            pixels[x, y] = (*channels, round(alpha * coverage))

    remaining = {(x, y) for x in range(width) for y in range(height) if pixels[x, y][3] > 20}
    components = []
    while remaining:
        seed = remaining.pop()
        component = {seed}
        queue = deque([seed])
        while queue:
            x, y = queue.popleft()
            for neighbor in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
                if neighbor in remaining:
                    remaining.remove(neighbor)
                    component.add(neighbor)
                    queue.append(neighbor)
        components.append(component)
    if not components:
        raise ValueError(f"No character pixels remain in {path.name}")
    character_pixels = max(components, key=len)
    for component in components:
        if component is not character_pixels:
            for x, y in component:
                pixels[x, y] = (0, 0, 0, 0)
    bounds = (
        min(x for x, _ in character_pixels), min(y for _, y in character_pixels),
        max(x for x, _ in character_pixels) + 1, max(y for _, y in character_pixels) + 1,
    )
    if bounds is None:
        raise ValueError(f"No character pixels remain in {path.name}")
    character = image.crop(bounds)
    scaled_width = round(character.width * 400 / character.height)
    character = character.resize((scaled_width, 400), Image.Resampling.LANCZOS)
    if scaled_width > 224:
        raise ValueError(f"Character is too wide for the shared canvas: {path.name}")
    canvas = Image.new("RGBA", (224, 448))
    canvas.alpha_composite(character, ((224 - scaled_width) // 2, 24))
    canvas.save(destination / path.name)
    print(f"{path.name}: {bounds} -> 224x448, feet at y=424")
