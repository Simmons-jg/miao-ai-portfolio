# JieJoe Logic To Miao Portfolio Specification

## Overview

- Target file: `src/components/PortfolioEditionsPrototype.tsx`
- Styling file: `src/app/globals.css`
- Screenshots:
  - `docs/design-references/jiejoe-home/desktop-02-kinetic-type.png`
  - `docs/design-references/jiejoe-home/desktop-04-photo-stack.png`
- Interaction model: scroll-driven kinetic typography plus hoverable archive cards.

## Source Pattern

JieJoe's page uses a sequence:

1. Identity manifesto
2. Short about statement
3. Skill/persona slices
4. Huge repeated kinetic type
5. Work index
6. Layered image/photo stack

## Adapted Pattern

For Miao, the equivalent should be:

1. Hero: AI product / AIGC direction / visual systems
2. Kinetic manifesto: "VISUAL FIRST", "PRODUCT CLEAR", "AI NATIVE", "SHIP READY"
3. Direction: visual evidence engine
4. Product: active runtime slot
5. Taste protocol: visible review criteria
6. Works: public visual archive with motion
7. Method: workflow runway
8. Fit: profile layer and contact

## Required Visual Treatment

- Keep background dark and cinematic.
- Use acid green as the single dominant accent.
- Do not use cartoon illustrations from the reference.
- Use large type as image, not as explanatory copy.
- Motion should feel scroll-driven and editorial, not dashboard-like.

## Component Changes

### Kinetic Manifesto

- Add a full-width section after hero.
- Four repeated tracks:
  - VISUAL FIRST / 视觉先行
  - PRODUCT CLEAR / 产品清晰
  - AI NATIVE / AI 原生
  - SHIP READY / 可交付
- Each track should move horizontally with CSS animation.
- On reduced motion, tracks remain static.

### Profile Layer

- Keep resume-derived facts abstract and low-profile.
- Use signals only:
  - AIGC visual direction
  - AI product demo thinking
  - Digital media and IT background
  - Bilingual creator context

### Works

- Keep horizontal scroll evidence cards for now.
- Later enhancement may replace or augment this with a TimeChannel-inspired 3D tunnel, but only after we map the user's actual work image aspect ratios.

## Responsive Behavior

- Desktop: manifesto tracks are oversized and cropped horizontally.
- Tablet: type scale reduces, tracks remain full bleed.
- Mobile: tracks stack tighter and do not block the chapter rail.
