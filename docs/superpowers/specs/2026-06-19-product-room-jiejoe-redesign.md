# Product Room Jiejoe-Inspired Redesign

## Goal

Redesign the portfolio's Product Room as a personal, cinematic lab scene instead of a product-marketing block. The section should prove that Miao is not only making AI images, videos, and music, but also designing the machine that can produce them.

The connected product project is:

`019e8c7e-2bc4-7f40-892d-72a6e03debb0`

During local development, the entry target can be:

`http://127.0.0.1:8888/app.html`

The product ID should appear only as a small debug/prototype chip, never as the hero message.

## Source Inspiration

Jiejoe's useful design logic is not "green and black" by itself. The important moves are:

- Treat a section as a stage, not a card.
- Use huge type as environment.
- Give each page a physical metaphor: photo stack, TV glitch, contact form machine.
- Keep copy short, personal, and direct.
- Let scroll, hover, and click reveal behavior instead of explaining everything.

For Miao, Product Room should become an `AI production cockpit`, not a SaaS feature grid.

## Positioning

Current product description is too close to:

> AI product lab / prototype in progress

New message:

> I am building a machine for AI video production.

Chinese version:

> 我正在做一个 AI 制片工作台。

Supporting copy:

> 剧本进去，风格、角色、分镜、封面、视频任务和生产画布出来。

English supporting copy:

> Script goes in. Style, assets, storyboards, covers, video tasks, and a production graph come out.

## Information Architecture

The site should not make `WORKS` a universal entry for Images / Videos / Music / Product. Each media type gets its own room:

- Images / Photo Room: existing Works image stack and TimeChannel.
- Videos / Video Room: video theater and glitch preview.
- Music / Music Room: waveform, playlist, and signal console.
- Product / Product Room: AI production cockpit.

Product Room lives as its own chapter and should not reuse the image archive visual model.

## Product Room Scene

### Scene Name

`PRODUCT LAB`

Alternative display lines:

- `BUILDING THE MACHINE`
- `AI PRODUCTION COCKPIT`
- `SCRIPT TO SHOT SYSTEM`

### Visual Composition

The section uses three depth layers:

1. **Background type environment**
   Huge `PRODUCT`, `LAB`, and `MACHINE` words sit behind the cockpit. These words should use varied treatments and motion.

2. **Foreground cockpit**
   A dark translucent software window sits over the type. It contains the production chain and live module preview.

3. **Peripheral instrumentation**
   Small debug chips, running lights, connection lines, progress ticks, and prototype ID sit around the cockpit.

The section should feel like a machine booting up inside a personal portfolio, not a dashboard card.

## Typography Grammar

The current project uses a strong heavy type system. Product Room should expand it with multiple typographic modes, inspired by Jiejoe's mixed word treatments.

### Giant Background Type

Use at least four type treatments:

- **Solid block word:** heavy cream fill, tight line-height, used for the main statement.
- **Outline word:** transparent fill, cream stroke, oversized behind the cockpit.
- **Sliced word:** duplicate text layers clipped into horizontal bands, offset by 2-12px on hover/scroll.
- **Signal word:** monospace/condensed small caps repeated in a scrolling strip.

Background type should not all share one font weight or style. The variation is part of the design.

### Motion Rules

- `PRODUCT` outline slowly drifts horizontally as the section enters.
- `MACHINE` or `LAB` appears in sliced bands with a scanline offset.
- A small repeated text rail scrolls continuously: `SCRIPT / STYLE / ASSET / STORYBOARD / COVER / VIDEO / CANVAS`.
- On reduced motion, all text remains static but keeps the layered typography.

### Font Direction

Use available local/system fonts first. Avoid relying on remote font downloads.

Suggested roles:

- Display block: heavy sans, ultra-bold, compressed with `scaleX()` where needed.
- Outline type: same family but stroked and transparent.
- HUD labels: monospace system stack.
- Chinese copy: heavy CJK sans for headings, normal CJK sans for body.

## Cockpit Model

The product cockpit has a production chain with seven nodes:

1. `SCRIPT` / 剧本
2. `STYLE` / 风格
3. `ASSETS` / 资产
4. `STORYBOARD` / 故事板
5. `COVER` / 封面
6. `VIDEO` / 视频任务
7. `CANVAS` / 生产图谱

These nodes come from the connected product project's real logic:

- Style system: presets, custom style, uploaded reference-image inference.
- Script parsing: story, character, scene, prop, risk, breakdown.
- Asset preparation: character, scene, prop, effect assets.
- Storyboard mode: storyboard sheet plus Seedance prompts.
- Cover/publishing material module.
- 3D blocking/stage preview.
- Canvas production graph.

## Interaction Model

### Scroll

When the section enters:

1. The huge outline `PRODUCT` word appears first.
2. The cockpit window slides or clips open.
3. The seven production nodes light up one by one.
4. The active node detail panel resolves into view.

### Hover

Hovering a node changes the live panel:

- The line connected to that node brightens.
- The node number pulses once.
- The right-side preview copy changes.
- A small "what this proves" chip appears.

### Click

Clicking a node locks it as active. The section should feel inspectable, not merely decorative.

Primary CTA:

- Chinese: `进入实验舱`
- English: `Enter the Lab`

Secondary CTA:

- Chinese: `查看生产链路`
- English: `View the Pipeline`

The primary CTA opens the local product app during development and later points to the deployed product.

## Node Copy

### SCRIPT / 剧本

Chinese:

> 把混乱想法拆成故事结构、角色、场景和风险提示。

English:

> Turns a messy idea into story structure, characters, scenes, and production risks.

### STYLE / 风格

Chinese:

> 预设、自定义描述和参考图一起决定影片的视觉路线。

English:

> Presets, custom notes, and reference images shape the visual route.

### ASSETS / 资产

Chinese:

> 角色、场景、道具和特效先被确认，再进入分镜。

English:

> Characters, scenes, props, and effects are confirmed before storyboarding.

### STORYBOARD / 故事板

Chinese:

> 用故事板模式把广告片、短剧和提案片压成可生产镜头。

English:

> Storyboard mode turns ads, short dramas, and pitches into producible shots.

### COVER / 封面

Chinese:

> 封面不是最后补图，而是从剧本卖点和视觉路线里长出来。

English:

> Covers are not afterthoughts; they grow from the hook and visual route.

### VIDEO / 视频任务

Chinese:

> 分镜、参考图和镜头语言一起进入视频生成任务。

English:

> Storyboards, references, and camera language feed the video task.

### CANVAS / 生产图谱

Chinese:

> 所有资产和任务连成一张能看懂的生产关系图。

English:

> Assets and tasks become a readable production graph.

## Main Copy

### Chinese

Headline:

> 我正在做一个 AI 制片工作台。

Body:

> 它不是作品墙。它是生产作品的机器：剧本进去，风格、角色、分镜、封面、视频任务和生产图谱出来。

Short proof line:

> 这个产品来自我的真实创作流程。

### English

Headline:

> I am building a machine for AI video production.

Body:

> It is not another gallery. It is the machine behind the work: script in, style, assets, storyboard, cover, video tasks, and production graph out.

Short proof line:

> The product comes from my own production process.

## Visual Details

- Dark glass cockpit, not nested cards.
- Acid green is the running signal, not the whole palette.
- Cream/ivory type carries the human personal-site voice.
- Thin red/orange error line can appear as a secondary debug accent.
- Use one product screenshot or UI fragment if available; if not, render a credible cockpit preview from the data model.
- Avoid generic "feature cards".
- Avoid showing raw long prompts in the portfolio.
- Avoid making the product ID visually dominant.

## Responsive Behavior

### Desktop

- Full viewport or near-full viewport scene.
- Huge background words can crop off-screen.
- Cockpit is 50-60% width, with node rail and active detail panel inside.
- Side chapter nav remains readable.

### Tablet

- Background type stays but becomes less cropped.
- Cockpit stacks its node rail over the active panel.
- CTA remains above the fold of the Product Room scene.

### Mobile

- Keep one giant background word only, likely `LAB` or `PRODUCT`.
- Nodes become a vertical sequence.
- Active detail panel follows the selected node.
- Animated text rails reduce speed or become static.

## Accessibility And Fallback

- All nodes are buttons with clear active state.
- Reduced motion disables continuous marquee and sliced text offsets.
- CTA links have explicit labels.
- Product Room must remain understandable without animation.

## Implementation Scope

This spec covers Product Room only.

Do not redesign Images, Videos, Music, or Contact in this step.

Do not replace the whole portfolio IA in this step.

Do not merge Product Room into the Works image archive.

## Verification

Before completion:

- Run `npm run lint`.
- Run `npm run typecheck`.
- Run `npm run build`.
- Open the portfolio locally.
- Verify Product Room at desktop around 1440px and mobile around 390px.
- Verify node hover/click changes active copy.
- Verify primary CTA points to the intended product app route.
- Check browser console for errors and warnings.
