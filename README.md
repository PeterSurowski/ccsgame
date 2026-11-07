# CCS Game

Standalone React + Vite app. Piece 1 implements the two-panel opening story:
Susan Laporte reviews the student report, then Chad Reichert bursts into her
office. Continue advances; Back returns to the first panel. Follow Chad enters
Piece 2: the overhead Worldview scene.

The top-center score panel stays visible in both panels: Budget 100/100,
Ave. GPA 85/100, Job Placement 20/100, Engagement 0/100. Story navigation
and movement do not change scores.

## Worldview controls

The four arrow keys move Susan. Hold a key for continuous movement;
diagonal movement has the same speed as straight movement. Space is reserved
for future non-movement interactions and currently does nothing (including no
page scrolling). WASD, Enter, and pointer clicks have no gameplay actions.
Story panels still use their existing buttons.

On touchscreens, hold anywhere in the playing field for 180 ms or drag more
than 8 screen pixels to steer toward your finger relative to Susan's screen
position. Speed stays fixed in every direction; a 24-pixel neutral zone around
Susan stops movement. Lift your finger, leave the field, or cancel the gesture
to stop. Only the primary touch (or pen) is used; mouse clicks do not steer.
Quick taps are reserved for the same future actions as Space and do nothing
in this scene. Touch gestures in the field do not scroll the page.

The camera follows Susan, keeping her centered in a zoomed 480-by-280 world-unit
viewport on desktop rather than displaying the full level. On narrow screens,
the portrait viewport shows a narrower area at the same 280-world-unit height,
keeping Susan larger instead of shrinking the wide desktop view. Areas beyond the map use the
same dark background as the walls.

Chad runs from the office down the hallway into Classroom 03, three doors down.
Walls and furniture block Susan. Walk through the marked doorway to enter the
classroom; arrival updates the objective automatically, without Space. You can
keep exploring after arrival. The subsequent classroom RPG scene is not built
yet. Reload the page to restart. Keyboard movement clears on focus loss.

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

[App.jsx](src/App.jsx) contains the scene data and shared original SVG office
illustration. The artwork is explicitly labeled as a placeholder, with invented
character appearances, not likenesses. It uses a modern comic-inspired direction;
no Dispatch artwork, branding, or other game assets are used.

Replace the illustration with approved scene images when available, retaining
descriptive alternative text. [App.css](src/App.css) styles the game frame and
responsive score panel. The subtitle and palette are provisional.

[Worldview.jsx](src/Worldview.jsx) renders the original overhead SVG map and
characters. [worldview.js](src/worldview.js) shares the map geometry between
rendering and collision detection and implements frame-rate-independent movement.
