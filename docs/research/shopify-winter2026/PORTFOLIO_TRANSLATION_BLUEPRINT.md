# Portfolio Translation Blueprint

Target studied: https://www.shopify.com/editions/winter2026

This document translates interaction language only. Do not reuse Shopify assets, characters, product screenshots, logos, copy, or product claims.

## What To Borrow

- Fixed editorial header over immersive scenes.
- Persistent chapter index that updates as the user scrolls.
- Long scroll story where each major chapter owns a visual world.
- Large, art-directed first viewport with a central framed title module.
- Section rhythm: full-bleed scene, then product/case modules inside the chapter.
- Mixed media feel: painterly background, product artifact, floating labels, motion layers.
- Lenis-like smooth scroll and scroll-position state changes.

## What Not To Borrow

- Shopify marks, product names, edition names, exact copy, screenshots, videos, icons, and image assets.
- The commerce feature taxonomy.
- The exact Renaissance characters or generated art compositions.
- A public 1:1 clone that could be confused with the source page.

## Portfolio Mapping

| Shopify Mechanism | Portfolio Translation |
| --- | --- |
| Renaissance Edition hero | AI Direction Edition hero |
| Left chapter edition list | AI role chapter index: Direction, Product, Algorithm, Work, Method |
| Scroll-driven feature chapters | Scroll-driven case study chapters |
| Product updates | Portfolio evidence entries |
| Product screenshots/videos | Original AI product artifact, workflow diagrams, generated/owned work media |
| Category progress index | Active chapter and case-state progress |
| Immersive scene changes | AI theatre background states tied to section IDs |

## Prototype In This Lab

Implemented at `src/components/PortfolioEditionsPrototype.tsx`.

- Uses original portfolio content.
- Uses no Shopify assets.
- Uses IntersectionObserver for active chapter state.
- Uses CSS sticky scenes and fixed index to mimic the interaction skeleton.
- Supports EN / 中文 switching.

## Next Step For Main Portfolio

The static `outputs/portfolio-site` should not be patched blindly. Use this lab to test the interaction skeleton first, then port the winning mechanics:

1. Replace bottom dock or old rail with the chosen chapter index model.
2. Make hero a framed "AI Direction Edition" scene.
3. Convert works into evidence chapters instead of cards.
4. Use scroll state to alter product artifact labels and background.
5. Keep GSAP / Lenis / Three.js in the final portfolio for richer motion.
