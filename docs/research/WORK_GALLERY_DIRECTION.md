# Work Gallery Direction

## Current Decision

Use a hybrid presentation:

- The site remains a scroll-driven portfolio narrative.
- The works section becomes a cinematic evidence channel, not a static wall.
- Original works from `E:\作品\作品` are used as-is. They are selected, cropped, sequenced, and animated, but not style-transferred.

## Why Not A Plain Feed

A social feed is useful for volume, but it makes the portfolio feel like content browsing instead of role proof. It can become a secondary archive view later, with filters for film, product, campaign, and original worlds.

## Why Not Full TimeChannel

`FranzLy/TimeChannel` is strong as an image-memory product: a 3D tunnel, photo rings, EXIF timeline, local import, focus mode, and story panel. For this portfolio, copying the whole tunnel would shift the site into an album app and pull attention away from AI product and method.

The useful ideas to adapt are:

- time/depth as navigation
- image planes arranged as a journey
- focus mode for one work
- lightweight HUD showing date, role, and evidence
- lazy asset loading so many works do not overload GPU memory

## Recommended Works Section

Create a pinned scroll chapter called `Evidence Channel`.

Desktop behavior:

- The section pins while vertical scroll drives a horizontal/diagonal gallery track.
- Each work appears as a large cinematic plate with original imagery.
- The active work expands slightly, receives chrome/acid linework, and reveals role proof.
- A side HUD updates with project type, contribution, tools, and outcome.
- Click opens a focused lightbox or detail panel.

Mobile behavior:

- Use a vertical snap stack instead of forced horizontal scroll.
- Keep one image dominant per screen.
- Use the same HUD content below each image.

## Candidate References

- FranzLy/TimeChannel: 3D photo tunnel, timeline HUD, focus mode, local album architecture.
- Codrops scroll-revealed WebGL gallery: DOM images synced with WebGL planes, shader reveal, GSAP + smooth scroll.
- masterjaneza/Horizontal-Scroll-Gallery---V3: simple horizontal canvas pattern with vertical wheel mapped to horizontal motion.
- GSAP ScrollTrigger examples: pinned horizontal pan and scrubbed reveals.
- flackr/scroll-timeline: CSS ScrollTimeline/ViewTimeline polyfill, useful only if we want progressive CSS-native scroll animation later.

## Implementation Shape

Keep the current Next.js component and add a `WorksEvidenceChannel` client island:

- Data source: typed array of selected work records.
- Rendering: Next/React DOM image plates first for reliability.
- Motion: GSAP ScrollTrigger pinned horizontal track.
- Texture layer: optional Three.js shader reveal behind or over active plates.
- Accessibility: keyboard focusable cards, reduced-motion fallback, non-hidden image content.

## Product Tie-In

The works channel should not only show images. Each work becomes proof for one of three interview claims:

- AI Director: shot logic, style continuity, narrative intent.
- AI Product Designer: demo thinking, product story, workflow translation.
- Algorithm Collaborator: evaluation criteria, model controllability, cost/latency awareness.
