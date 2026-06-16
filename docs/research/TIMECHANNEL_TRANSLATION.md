# TimeChannel Translation

## Source Read

Reference: `FranzLy/TimeChannel`.

The useful implementation pattern is not its UI chrome. It is the scene model:

- `world/tunnel.js`: image cards are grouped into depth rings, placed on a z-axis tunnel, gently rotated, floated, and recycled.
- `interact/controls.js`: wheel, drag, keyboard, and pointer parallax push the camera through the tunnel with inertia.
- `ui/timeline.js`: HUD state follows depth, so the current image feels selected by motion rather than by a static grid.

## Portfolio Adaptation

For this portfolio we should not copy the whole album product. Import, EXIF sorting, IndexedDB, story panels, infinite photo recycling, and sky presets would make the page feel like a photo app.

The adapted works section keeps:

- Three.js canvas as the visual primary surface.
- Scroll-driven z-depth progression.
- Pointer parallax.
- One active work with a HUD, index, tags, and source-image link.
- Original user works as the textures.

The adapted works section removes:

- Album import.
- EXIF/date timeline.
- Infinite recycling.
- Full-screen lightbox for now.
- Reference-site screenshots.

## Current Implementation

Implemented in `src/components/PortfolioEditionsPrototype.tsx` as `WorkTimeChannel`.

The component uses the current `works` array and arranges the selected images into a cinematic depth channel. Scroll progress maps to active work index. Mouse movement adds camera parallax. The DOM layer holds the portfolio argument, while WebGL holds the visual proof.

This is closer to the references because the section now behaves like an interactive system, not a static gallery.
