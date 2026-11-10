# CCS Game

During any video, a quick tap/click or nonrepeating Space skips playback to
that video's ending freeze frame and dialogue/choices, stopping its audio.
Dialogue requires a separate input to continue. The intro's first input still
starts the opening video; it does not skip it.

Standalone React + Vite app. First, [intro.png](src/assets/intro.png) is displayed
with a rounded translucent gray prompt near the bottom:
"Tap screen or press spacebar to begin". A quick tap/click or Space starts the
opening video; it does not play before the player begins. Reload restores the intro.

The opening plays the supplied
[CCSGame-scene1.mp4](src/assets/scenes/CCSGame-scene1.mp4) inline with sound.
If the browser blocks autoplay, tap Play opening video to start it.
When playback ends, the preloaded [freezeframe1.png](src/assets/scenes/freezeframe1.png)
replaces the video, without looping or rewinding.

At 17 seconds of video playback (not time spent loading or buffering), a
rounded translucent gray overlay displays:

> Chad Reichert: Susan, come quick! There's something very wrong with the students in the UX class.

Below it, a smaller hint reads "Tap the screen or hit the spacebar to continue."
The overlay stays visible over the video and subsequent freeze frame.
A tap/click or Space during playback skips to the freeze frame and shows the
dialogue immediately, even before 17 seconds. Another input from that ending
frame enters Worldview. Playback and image errors are displayed.

The score panel stays visible in both modes: Budget 100/100,
Ave. GPA 85/100, Job Placement 20/100, Engagement initially 0/100.
All score changes count through integer values over approximately half a second,
with a quiet synthesized tick per integer and synchronized meter updates.
Audio is enabled by the player's first keyboard or pointer interaction.
Future score changes should update the score targets in [App.jsx](src/App.jsx)
so the shared [animation hook](src/useAnimatedScores.js) applies automatically.

## Game frame and branding

Both modes share a 9:16 portrait game frame, sized to fit the browser viewport
and centered horizontally and vertically. The surrounding page is black.
The frame includes the persistent header and story/playfield content; UI sizes
scale with the frame, not with the laptop's width.

The header uses the supplied [CCS logo](src/assets/ccslogo.jpg) at the upper left
beside the four scores, with black labels, values, and meters. Its background is
`#FBE013`, sampled from the logo's yellow background. The logo is copied into
this standalone app; there is no runtime dependency on the original sandbox.

## Worldview controls

The four arrow keys move Susan. Hold a key for continuous movement;
diagonal movement has the same speed as straight movement. Space is reserved
for future non-movement interactions and currently does nothing (including no
page scrolling). WASD, Enter, and pointer clicks have no gameplay actions.
The opening scene uses tap or Space once its dialogue appears.

On touchscreens, hold anywhere in the playing field for 180 ms or drag more
than 8 screen pixels to steer toward your finger relative to Susan's screen
position. Speed stays fixed in every direction; a 24-pixel neutral zone around
Susan stops movement. Lift your finger, leave the field, or cancel the gesture
to stop. Only the primary touch (or pen) is used; mouse clicks do not steer.
Quick taps are reserved for the same future actions as Space and do nothing
in this scene. Touch gestures in the field do not scroll the page.

The first hallway Worldview displays a translucent, non-interactive controls
hint beneath Susan: four keyboard arrow keycaps, "or", and an animated finger
demonstrating circular touch steering. Touches pass through the hint to the
playfield. It remains visible in the hallway only, not the quad or story scenes.
Reduced-motion preferences show a static finger instead.

The camera follows Susan, keeping her centered with a 280-world-unit view
height. The view width adapts to the available playfield inside the portrait
game frame, on phones and laptops alike. Areas beyond the map use the
same dark background as the walls.

Worldview is currently an explorable foyer preview using the supplied
[background1.png](src/assets/backgrounds/background1.png), not the old
office-and-classrooms map. Susan starts by the left doorway, with Chad just
ahead of her. Chad walks across the floor, then stands beside the right doorway
in his idle pose facing right toward the door, leaving the entrance clear.
A glowing, bobbing yellow location arrow points to the door, using the same
arrow artwork and animation as the campus map.
His route uses the same world coordinates as the traced floor boundary.
Walking up to the right doorway automatically enters the classroom scene;
Space or a tap is not needed to enter. All Worldview interface
text and character labels are removed except for the score header and controls hint (the image's
printed signs remain). Asset errors are still reported visibly.

Collision uses a foot-radius against a conservative floor polygon traced in
the image's native 1024x448 coordinates, defined in [worldview.js](src/worldview.js).
The background renders at half size (512x224 world units) while character
sizes and camera zoom stay unchanged. The floor polygon and starting positions
use the same half-scale transform to stay aligned with the artwork.
Glass, wall bases, and display edges block movement; shadows do not.
This initial trace can be refined against an approved collision-marked image.
Reload to restart. Keyboard and touch movement clear on focus loss.

## Sleeping students scene

The classroom plays [CCSGame-scene-sleepingstudents.mp4](src/assets/scenes/CCSGame-scene-sleepingstudents.mp4)
with sound, then displays [freezeframe-sleepingstudents.png](src/assets/scenes/freezeframe-sleepingstudents.png).
Dialogue appears after the video ends or is skipped:

> Susan: What's happening?
>
> Chad: It's our engagement score. It's dropped to zero. The professor can't keep them awake.

A quick tap/click or nonrepeating Space replaces the dialogue with:

> What will you do?
>
> A. Ask Professor Philip McAvoy to teach the class. He's a seasoned professor. He'll know what to do.
>
> B. Ask Professor Matt Raupp to teach the class. He's an expert in UX. If anyone can breathe life into the topic, it's him.

The freeze frame stays behind the choices. Tap or click a choice to confirm it.
The first Up or Down arrow highlights A in the score header's yellow; subsequent
Up/Down presses select A/B, and Space confirms the highlighted choice.
Space alone does not choose an option before one is highlighted.
Playback and asset errors are visible; blocked autoplay offers a Play button.

## Campus map

Either professor choice opens [campusmap.png](src/assets/scenes/campusmap.png)
in a separate map scene beneath the unchanged score header. The full image
height fits the playfield; the wider image is cropped horizontally without distortion.
Swipe/drag to pan or hold Left/Right arrow keys. The translucent, pulsing side
arrows are non-interactive hints, not buttons; gestures pass through them.
Panning stops at the image edges and clears when the page loses focus.

A glowing yellow location arrow bobs over the boulder in the circular walkway
for Philip (A), or the entrance to the upper building for Matt (B). The marker
stays attached to its map location while panning. Reduced-motion preferences
disable bobbing and hint pulsing. The prompt reads "Tap the screen or press the
spacebar to continue." A quick tap/click or nonrepeating Space enters the quad;
swipes/drags pan without advancing. Both professor choices enter the same quad.

## Quad Worldview

Susan starts in [quad-lowerleft.png](src/assets/scenes/quad-lowerleft.png),
at the lowest foot-safe point of its red-marked walkable path. Every section
entry uses that section's lowest safe row, facing up.
The camera follows her with a 280-world-unit view height (50% less zoom than
the previous 200% view). Her feet normally sit 75% down the playfield, revealing
more ground ahead. At image boundaries the camera stops scrolling while Susan
continues toward the edge, so no area outside the image is visible. Touch
steering follows her actual screen position, including when the camera stops.
If a viewport is wider than a section, the camera fits within the image while
preserving the viewport aspect ratio.
The foyer retains its original centered camera.
Only the current section is rendered. Reaching its left or top edge enters
[quad-upperleft.png](src/assets/scenes/quad-upperleft.png) at its bottom walkway;
reaching its right edge enters [quad-lowerright.png](src/assets/scenes/quad-lowerright.png)
at its bottom walkway. Walking back down to the bottom of either destination
returns to lower-left, also at its bottom entry. Returns are armed only after
walking at least 30 world units up from the entry, preventing immediate bouncing.
Other unmarked areas block movement.

The images render at half their source dimensions. Susan renders 25% larger
than her original size in lower-left and at half her original size in upper-left
and lower-right, anchored at her feet. Lower-right camera zoom is reduced by
25%, showing a 373.33-world-unit-high area while retaining image-edge clamping.
Movement speed and collision rules stay unchanged.

Approaching within 75 world units of the grounded student in lower-left pauses
movement and shows:

> Dazed student (mumbling): Why am I here? What am I learning? Will I land a job after all this?

The hint reads "Tap the screen or press the spacebar to continue." A quick tap,
click, or nonrepeating Space dismisses the dialogue and resumes exploration.
The dialogue appears once per quad playthrough, including across section returns.
Collision data in [quadWalkable.json](src/quadWalkable.json) is generated from
the three `quad-*-walkable.png` references: only solid red areas permit walking,
inset by Susan's 13-world-unit foot radius. Unpainted grass, obstacles, and
the student-shaped gap remain blocked. The reference images are never rendered
or imported into the game; only their generated collision rows are used.
Artwork and reference dimensions must match; lower-left now renders at 632x424,
and the other sections at 512x512. Regenerate after editing the red guides:

```powershell
python .\scripts\prepare_quad_walkable.py
```

This uses the existing Pillow and NumPy preparation dependencies.
Chad is not added to the quad yet.
No Worldview text is shown beyond the persistent score header.

## Meeting Philip McAvoy

If Philip (A) was selected in the classroom, walking to the upper-right end
of the marked lower-right quad path plays
[CCSGame-MeetPhilipMcAvoy.mp4](src/assets/scenes/CCSGame-MeetPhilipMcAvoy.mp4)
with sound. Choosing Matt (B) leaves the same endpoint inactive.
After playback, [CCSGame-PhilipMcAvoy.png](src/assets/scenes/CCSGame-PhilipMcAvoy.png)
appears with:

> What do you think?
>
> A. Looks great, but what does it do?
>
> B. Never mind that, we have an emergency!

These responses support tap/click or Up/Down plus Space. A explains the gamified
enrollment idea; tap or Space advances to
[CCSGame-McAvoyThinking.png](src/assets/scenes/CCSGame-McAvoyThinking.png) and the
two requests for UX teaching help. Either request leads to the previous-instructor
question. Initial response B skips the explanation and shows Susan's urgent
request alongside that question. Either engagement-score answer returns to the
original Philip image with "Philip: You can count on me!".
A final tap or Space fades the scene to black, then raises Engagement by 10
over approximately 500 ms while the playfield stays black. After the score settles,
[CCSGame-SusanAtKeyboard.png](src/assets/scenes/CCSGame-SusanAtKeyboard.png)
fades in with Susan congratulating Philip. A separate tap or Space switches to
[CCSGame-PhilipWeeping.png](src/assets/scenes/CCSGame-PhilipWeeping.png) and his
plea to remove the class from his roster. This is the current story endpoint.
Input during the fades or score animation does not skip the following dialogue.
The score header remains visible throughout. Choice highlights reset at every
question, preventing one confirmation from answering the next question.
Other scores remain unchanged. Playback errors are visible and blocked autoplay
offers a Play button.

Both characters use transparent sprite sheets extracted from the supplied MP4s.
Walking cycles run at 24 fps with 19-28 frames per cycle, selecting similar
start/end poses to reduce loop seams. Idle poses use the uploaded still images.
Side cycles face right and are mirrored only for leftward movement; Chad's
left-facing source video is mirrored during preparation. Diagonal movement
uses the dominant facing. Walking plays only during actual movement, resetting
on a facing change or stop. Wall collisions switch Susan to idle; Chad idles
at the end of his route. Sprites share foot anchors and are depth-sorted.

Original uploads are preserved in
[sprites-susan](src/assets/sprites/sprites-susan), including Chad's assets in its
`sprites-chad` subfolder. Runtime sheets and frame metadata live in
[animated](src/assets/sprites/animated): 112x224 cells, approximately 200-pixel
character height, feet at y=212. Backgrounds and isolated compression specks
are removed locally; no video is played directly inside Worldview.
The older `prepared` images are not used by the game.
To regenerate after changing original videos or idle images:

```powershell
python -m pip install Pillow imageio-ffmpeg numpy
python .\scripts\prepare_walk_cycles.py
```

## Run

Requires Node.js 22.12+ (or a supported newer release).

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite.

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd test
```

## Artwork and story

[App.jsx](src/App.jsx) owns the mode and persistent scores.
[OpeningScene.jsx](src/OpeningScene.jsx) handles the supplied video, freeze
frame, timed dialogue, and continuation. [App.css](src/App.css) styles the
portrait frame, branding, and overlay.

[Worldview.jsx](src/Worldview.jsx) renders the foyer artwork and handles input.
[CharacterSprite.jsx](src/CharacterSprite.jsx) renders the current sprite-sheet
cell for either character; [characterSprites.js](src/characterSprites.js) loads
the generated sheets and metadata.
[worldview.js](src/worldview.js) implements floor collision, camera, animation
timing, and frame-rate-independent movement.
