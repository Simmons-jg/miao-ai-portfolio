# JieJoe Home Behavior Study

Source: https://www.jiejoe.com/home

## Extraction Summary

- Desktop viewport: 1440 x 900
- Desktop scroll height: 11519 px
- Mobile viewport: 390 x 844
- Mobile scroll height: 6223 px
- Media detected: 73 images, 20 SVGs, 2 canvases, 0 videos
- Main fonts detected: "Noto Sans SC", plus custom `eng` and `zh` font-family aliases
- Fixed UI: top-left animated logo, top-right contact control, custom scrollbar/progress element

## Interaction Model

- Overall page: scroll-driven long-form portfolio narrative.
- Loading: time-driven full-screen overlay.
- Header: fixed overlay, minimal controls, animated logo.
- Hero and kinetic sections: scroll-driven reveal and position movement.
- Skill blocks: scroll sequence, role-by-role identity framing.
- Work rows: list-based interaction surface, likely hover/cursor preview behavior.
- Photo stack: layered images with scroll-position composition.
- Contact/menu: click-driven overlay navigation.

## Design Lessons For This Portfolio

- The first screen should not explain everything. It should make a memorable identity claim.
- Big type can be a visual asset. It should not be treated as plain copy.
- A portfolio can show skills as role slices rather than resume bullets.
- Work evidence can be presented as an archive index plus media motion, not a flat grid.
- A fixed social/contact layer is appropriate, but should stay light and not compete with the main motion.

## Boundaries

- We should not copy JieJoe's illustrations, exact color palette, text, logo, or work layout.
- We can borrow interaction principles: fixed minimal nav, kinetic typography, role slices, work index, layered image stack.
- Our implementation should stay aligned with the current Miao visual system: dark cinematic background, acid green accent, chrome glass, GSAP/Lenis/Three.js motion.
