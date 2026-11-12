# CCS Game

## Publishing

The site uses the custom domain `ccsgame.surowski.com`, so Vite's `base` is `/`,
not a repository-name path. `public/CNAME` preserves the custom domain in each
build. To publish manually, run `npm run build`, then, only after it succeeds,
`npx gh-pages -d dist` (or use the SSH remote override if HTTPS uploads fail).

In the draw-to-protect sidescroller, bricks striking a student's visible head
or torso kill that student and shatter, just like hits near the feet. A separate
sensor follows each walking sprite without changing its ground movement.

## Final hiring decision and endings

Winning all three interview games unlocks Peter's final hiring question on the
Susan-and-Peter interview image. Selecting a question alone does not count as a
win. The final successful game fades directly into the hiring decision, regardless
of completion order. The college maze reflection is shown only when other
interview games remain.

Hiring Peter fades into the happy-ending video, followed by the dialogue on
ending images 4, 5, and 6. The supplied unnumbered happy-ending image has been
renamed [CCSGame-happyEnding5.png](src/assets/scenes/CCSGame-happyEnding5.png).
Tap or Space skips the video or advances each dialogue scene; a blocked video
offers a Play button and media errors are displayed.

Rejecting Peter leads to a generated university hallway. After the office exit
and Peter's warning, tap repeatedly or repeatedly press Space to outrun the
student horde. Holding Space does not count as repeated taps. Once the horde is
offscreen, the chase continues for four more seconds before Peter falls, tips
clockwise, and bounces twice. Susan runs ahead during his fall; the camera frames
Peter at the far left and Susan at the far right. Choices pause the chase.
Returning for Peter sends Susan left with each tap. The zombies stay offscreen
until she reaches him, then enter from the left as Susan turns to run right
again. Both choices end with Susan being
caught after five more seconds, regardless of tapping speed. The horde then
fully overtakes Susan in the hallway before fading to black and fading into
the YOU LOSE screen. Restart input is enabled after the fade-in finishes.
The supplied zombie moaning audio starts when the horde first enters view,
loops through the chase, and fades to silence with the hallway fade-out.
Blocked playback offers a Play zombie sounds button; audio errors are displayed.
Failing to keep
ahead during the initial run can also lead to the hallway loss image.

The ending restart prompts reset the entire game, including scores and all
interview progress, rather than retrying the resume challenge.

Chase animation atlases are derived from the supplied running/horde videos with
their baked-in white/checkerboard backgrounds removed. Regenerate them with
`python scripts/prepare_chase_assets.py` (Pillow, NumPy, imageio-ffmpeg).

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

The classroom plays [CCSGame-scene-sleepingstudents-h264.mp4](src/assets/scenes/CCSGame-scene-sleepingstudents-h264.mp4)
with sound, then displays [freezeframe-sleepingstudents.png](src/assets/scenes/freezeframe-sleepingstudents.png).
The browser version uses H.264 video, AAC audio, and fast-start MP4 metadata;
the original HEVC video is retained but is not shipped in the build.
Playback is requested when the scene mounts rather than waiting for media
preloading, which iOS may defer. A Play button remains available while loading
or when autoplay is blocked; tap or Space in those states requests playback.
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
plea to remove the class from his roster. Continue to Susan thinking and
"What will you do?" with A (hire), B (push Philip), and C (ask Matt).
The game tracks professors asked during the playthrough; C is omitted if Matt
has already been asked. A opens the hiring introduction; C fades Susan's scene to black,
then fades in the campus map with Matt's building-door marker. Input is paused
during both fades. Continue with tap or Space, then walk through the quad to
the upper-left doorway, just as when Matt was chosen in the original classroom.
Existing scores and professor history are preserved during this trip.

Choosing Matt in the original classroom shows the campus-map marker over the
building entrance. Tap or Space enters the quad as usual. Follow the path into
the upper-left section and reach its highest walkable tip to enter the Matt
scene. The trigger uses the top 12 world units of the foot-safe path and only
activates when Matt is the selected professor.

## Matt Raupp conversation

Both Matt selections lead through the campus map and upper-left quad doorway to the same
[MattScene.jsx](src/MattScene.jsx) conversation, with editable text in
[mattDialogue.js](src/mattDialogue.js). A separate tap/click or nonrepeating
Space advances each page: Matt reviewing the project, the nervous student,
happy Matt, the weeping student, then two dialogue pages on the hallway image.
The final continuation fades to black before adding 10 to Engagement and
10 to Job Placement, capped at 100. Both use the shared half-second counting
animation and ticks; previous score gains are retained. After the scores settle,
Susan at her keyboard fades in, then a separate input shows sleeping Matt.
Continue to Susan thinking and a three-choice decision. Hiring (B) opens the
hiring introduction. C is omitted if Philip has already been asked;
otherwise it fades to black and back into the campus map with Philip's marker,
then uses the normal lower-right quad encounter route.

Pushing Matt (A) fades out and counts Engagement down to 0, retaining Job Placement.
Matt pushing through fades in; continue to Matt mobbed by students, then fade to
the shared uprising ending. Tap or Space restarts the entire game, as in Philip's
ending. Input cannot skip score animations or fades.

## Resume Challenge introduction

Hiring from either professor's decision fades to black, then fades in Susan
at her keyboard with "Susan: Time to go through these resumes." A separate
tap/click or Space shows [CCSlogo.jpg](src/CCSlogo.jpg) and plays an original synthesized
desktop-startup chime (not a Windows recording).
The logo sits above the instructions on a background matching the JPEG's
yellow exactly (`#fbe013`). Below it are the Resume Challenge title, goal,
Bad Candidates on the left and Good Candidates on the right, a translucent
left/right swiping hand, alternating arrow-key hints, and the revolt warning.
Reduced-motion preferences make the hints static. The score header and existing
scores remain unchanged until a candidate is accepted. Tap, Space, or the Start
button begins the challenge.

The 12 resumes and effects are editable in [resumeCandidates.js](src/resumeCandidates.js).
They shuffle once per challenge. Swipe right, press Right,
or click Accept to hire; left/Reject skips a resume without changing scores.
After each pass through the deck, all unhired candidates appear again in the
same order. Hired candidates never reappear.
Each resume fits the available playfield without scrolling, with compact
experience rows and automatically fitted typography on viewport changes. Each card displays
the portrait, experience, degree, summary, strengths, and weaknesses. Score effects
and reasons are hidden until a hire is made.

Rejected cards swipe off to the left in 350 ms, mirroring the hiring animation,
then reveal the next unhired resume without score effects.
After hiring, the card swipes off to the right in 350 ms. The playfield then
stays empty while Budget, GPA, Job Placement, and Engagement update one at a time,
capped at 100 but allowed below 0, using the shared half-second counting/tick animation.
A translucent signed amount and its reason appear directly beneath the relevant
header score for 1.5 seconds, fading before the next effect begins.
Amounts are CCS yellow and explanations remain white;
both use locally bundled Comic Neue Bold, licensed under the
[SIL Open Font License](src/assets/fonts/OFL.txt). Other game text is unchanged.
Zero effects
display 0 and "No change". There is no post-hire summary card or extra confirmation;
the next resume or result appears automatically after all four effects.
Sorting and continuation pause during the exit and score sequence.
Reduced-motion preferences make the card exit immediate.
Only after all three hires and their score effects finish is the result checked.
Any final stat below 0 causes a loss; exactly 0 is allowed. Intermediate negative
scores can recover through later hires. The deck never runs out.
Loss fades out and into Zombies in the
Hallway with "Don't finish with a score below 0" and "TRY AGAIN!". Tap/Space retries only
the resume challenge: entry stats are restored and all 12 resumes reshuffle.
It does not replay the professor storyline or hiring introduction.

Three surviving hires fade into the conference scene. Tap/Space shows Peter's
resume and Susan naming him; another input fades into Susan and Peter's interview.
Choosing question B now prints "Peter: It all started with Oregon Trail...",
then fades into an original retro side-scrolling flashback minigame. The player
starts as a bike-riding boy at center screen with a bus on the far right, moves
left/right with Arrow keys or by touching left/right of center, and follows
Peter's scripted milestones: yard-sale Commodore 64, adulthood, young family,
door-to-door client searches (including two repeatable building choices), and
the M2Media breakthrough before fading back to the Susan interview scene.
Question A first keeps the interview image and shows Peter's "It all started at
Mt. San Jacinto College..." lead-in. A separate tap/Space fades into the Maze
Game, using the supplied illustrated campus backgrounds, arranged as
`A B C / D E F / G H I`. The layout is fictional, not a wayfinding map of the
real college. Peter starts in H beside the first student.
Arrow keys or hold/drag steer Peter through the red-painted walkable paths.
Only the clean backgrounds are displayed; the `MazeGame-?-Walkable` guides
generate foot-safe collision data in [mazeWalkable.json](src/mazeWalkable.json).
The updated B and G guides include their newly painted walking-space expansions.
The camera stays within each image, at 1.25x the original maze zoom. Peter's
base sprite is 75% of its previous world size. NPC cutouts match Peter's base
height. All characters scale by their foot position in the full background:
200% at the bottom, interpolating linearly to 60% at 70% up the image
(30% from the top), remaining at 60% above that point.
On D, Peter shrinks at twice the normal rate when moving upward, anchored at
the same 200% bottom size and clamped to the same 60% minimum.
The NPC on D is rendered at half its usual depth-scaled size.
He starts far enough from the first
student to approach him deliberately, with that student still in view.
There is no corner title box. Palms use the requested image-relative placements.
G's palm is shifted 50 source-image pixels right and up; D's is shifted
50 source-image pixels left (25 world units per 50 image pixels).
A's palm is shifted 50 pixels right/up, B's 50 pixels up, and C's
50 pixels right/100 pixels up. The seated NPC on I is shifted 100 pixels up.
Maze movement tries nearby forward directions when blocked, allowing Peter to
slide along diagonal and jagged boundaries while keeping his feet walkable.
This behavior is maze-specific; the earlier Worldview movement is unchanged.
Image changes happen at path endpoints,
with a re-entry guard to prevent immediate bouncing.
Stationary, transparent cutouts of the supplied standing/seated students
offer route-accurate clues when
approached. The opening narration pauses movement and time. A nearby first
student introduces the deadline; after dismissing that conversation, 3:00
glows for three seconds before the clock runs. Every subsequent conversation
pauses time until a fresh tap/Space. Touching the Admissions front door wins
and fades back to the interview image with Peter's reflection about his first
taste of college and the professors who inspired him. A separate tap/Space
returns to the choices. The supplied student line stands outside the marked
Admissions doorway in F. Palm cutouts are foreground layers: Peter can walk
behind their crowns. Peter uses his supplied front/back/side stills and walking
videos, converted to the same transparent, foot-aligned sprite-sheet format
as Susan. Originals are preserved.
Timeout shows the requested loss/retry text;
tap/Space resets the maze, timer, and conversations only.
Completed A/B/C choices stay disabled on return, in any order.
These games do not change scores.
The authored exits are directed links, not inferred grid neighbors:
A → D/B; B → E/A/C; C → B/F; D → G/A; E → H/D/B;
F → D/I; G → H/D; H → G/I; I → H. A arrivals from D use the bottom-left
path; B arrivals from A use the upper-left path. H's exit to G and arrivals
from G use the path touching the left border, not the upper-left interior tip.
Both right-border paths in G lead to D across their full walkable edge spans.
Only I's paths touching the left or bottom image border return to H.
Its interior right-hand and lower-center tips do not trigger transitions.
B's entire walkable bottom border leads to E; D's entire walkable bottom
border leads to G. Border triggers allow for the collision mask's small safety
inset, and cover every walkable part rather than one point.
Routes, student placement and dialogue live in [mazeGame.js](src/mazeGame.js).
To regenerate masks, student/palm cutouts and Peter sprites, run
`python scripts\prepare_maze_assets.py` with the existing Pillow, NumPy and
imageio-ffmpeg tools. The shared sprite preparation helpers now have a main
guard so they can be reused without regenerating Susan or Chad.
Result text, images, and transitions live in [ResumeResult.jsx](src/ResumeResult.jsx).

### Question C: Draw to protect the students

C shows Peter's "Because I love to teach!" reply on the interview image.
Tap/Space fades to [platformer-background.jpg](src/platformer-background.jpg),
his continuation, and translucent finger/mouse drawing instructions.
Tap/Space begins the rescue game. The finger and mouse icons circle outside the
dialogue panel, with no text below them. Ten students walk right automatically;
the player cannot steer them. Five gaps/steps follow the supplied
[reference](src/platformer-reference.png) and
[solution guide](src/platformer-reference-withSolutions.png). A sixth intended
stroke shelters the Kern Clock and RoboCop area from falling bricks.

Mouse and touch draw physical lines. There is no stroke-count limit, but each
stroke has a 336-source-pixel arc-length limit (168 world units), 40% shorter
than the original limit. On release,
Matter.js applies gravity and collisions; the lightweight strokes can settle,
rotate, fall into gaps, and respond slightly to students' footsteps. Increased
damping/friction, zero bounce, and sleeping keep settled lines stable. Lines
receive extra damping once supported and nearly still; footsteps do not wake
sleeping lines. Reaching the third platform shows Peter's
"I want to help them avoid the many pitfalls I fell into." narration once,
without pausing the students.
At the Kern Clock, that narration is replaced by Peter's
"With good skills, they can get a good job, and they'll be sheltered from many
of the hardships we face in life." It triggers once per attempt when a student
reaches the clock at walking level, without pausing gameplay.
Strokes
are not anchored or snapped to the intended solution. Bricks shatter on impact;
Beam density is 20x the earlier setting and rotational inertia is tripled.
Dense pointer samples are simplified before building collision shapes.
New strokes intersecting ground/ink are lifted only enough to clear it (up to
60 world units); if they cannot clear, a visible message asks the player to
draw elsewhere. Shattered bricks do not apply a second rigid-body impact.
students hit by bricks or falling into gaps use sideways still-image poses.

The portrait viewport always follows the farthest-right student, including
while drawing. There are no manual panning controls.
The game pauses when the browser tab is hidden.
Once all ten students have either exited or died, at least one survivor wins;
all ten dead shows the retry message directly over the visible level background,
and tap/Space restarts only this game.
A win fades back to Susan and Peter, with C disabled.

Logic, terrain tracing, physics, and stroke limit are in
[studentRescue.js](src/studentRescue.js); rendering/input are in
[StudentRescue.jsx](src/StudentRescue.jsx). The existing score header remains
visible and unchanged. Supplied student stills and the walking video are
converted to transparent five-character sheets by
`python scripts\prepare_platformer_assets.py`, preserving original uploads.

Candidate effects retain the previous balance. Budget, GPA, and Peter's effects are unchanged.
Paige's Job Placement is -30 (limited professional experience), Barb's Engagement
is -25 (no full-time teaching experience), and Al's Engagement is -20
(disorganized lessons). These replace 0, +20, and -15 respectively.
All 3,960 ordered teams across the three storyline starting-score states are
regression-tested against the final-score rule. Unlike the former immediate-loss
rule, allowing recovery and final zero scores means Peter is no longer mandatory
in every winning team. For example, Sammy, Al, and Paige can win from the
both-professors starting scores, finishing with Engagement at exactly 0.
Hiring order can still affect totals when a score reaches the upper cap of 100.

B fades out, counts Engagement back to 0 with the shared ticks, then displays
Philip teaching, two zombie-student images, and Philip running away.
Each dialogue advances with a separate tap or Space. The supplied teaching image
is named [CCSGame-PhilipTeaching.png](src/assets/scenes/CCSGame-PhilipTeaching.png);
the running image has the supplied doubled prefix,
[CCSGame-CCSGame-PhilipRunning.png](src/assets/scenes/CCSGame-CCSGame-PhilipRunning.png).
The sequence ends on black with "You didn't stop the student uprising.",
"THE END", and a retry prompt. Tap or Space restarts at the introduction,
resetting every score, professor history, scene, and encounter state.
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
