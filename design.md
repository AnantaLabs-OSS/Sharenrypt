# Universal Design System & Style Guide

This document defines the comprehensive design language, styling rules, and component architecture for the "Futuristic Premium" aesthetic. Feed this file to an AI agent to replicate the exact visual style and behavior of the website without referencing specific brand names.

## 1. Core Aesthetic Philosophy
*   **Theme**: Ultra-Dark Mode, Cyberpunk-meets-Luxury.
*   **Vibe**: High-tech, mysterious, premium, polished, kinetic.
*   **Key Techniques**: Glassmorphism, Neon Gradients, mixed Serif/Sans-Serif typography, Micro-interactions.

## 2. Design Tokens

### Color Palette
*   **Backgrounds**:
    *   **Void Black**: `#030303` (Main Page Background)
    *   **Deep Gray**: `#0a0a0a` (Secondary Sections/Modals)
*   **Text**:
    *   **Primary**: `#EDEDED` (Off-white for ease of reading)
    *   **Secondary**: `#b0b0b0` (Muted gray for subtitles)
    *   **Muted**: `#707070` (Border lines, inactive states)
*   **Accents (The "Neon Core")**:
    *   **Cyber Cyan**: `#00F5FF` (Primary Call-to-Action, Highlights)
    *   **Electric Purple**: `#7000FF` (Secondary accent, gradients)
    *   **Success Green**: `#4ade80` (Status indicators)
    *   **Warning Orange**: `#fb923c`
*   **Borders**:
    *   **Base**: `rgba(255, 255, 255, 0.1)` (Subtle, barely there)
    *   **Hover**: `rgba(0, 245, 255, 0.3)` (Cyan glow)

### Typography
*   **Headlines (Display)**:
    *   **Family**: Serif (e.g., 'Playfair Display', 'Merriweather').
    *   **Usage**: `h1`, `h2`, `h3`, `h4`.
    *   **Style**: Bold, High Contrast vs Body.
    *   **Size**: Massive `h1` (clamp(2.5rem, 6vw, 5rem)) to minimal.
*   **Body (Content)**:
    *   **Family**: Sans-Serif (e.g., 'Inter', 'Roboto', 'system-ui').
    *   **Usage**: Paragraphs, Buttons, UI Elements.
    *   **Style**: Clean, readable, slightly tall line-height (1.6 to 1.8).

### Geometry & Spacing
*   **Border Radius**:
    *   **Cards/Containers**: `1rem` (16px) or `1.5rem` (24px).
    *   **Buttons/Tags**: `9999px` (Full Pill Shape).
*   **Spacing**:
    *   Generous whitespace. Sections are separated by `6rem` to `10rem`.
    *   Content padding inside cards is `2rem`.

## 3. Visual Effects (The "Secret Sauce")

### Glassmorphism (The "Glass" Class)
Use this CSS for any floating element or card overlay:
```css
.glass {
  background: rgba(10, 10, 10, 0.8); /* Dark translucent base */
  backdrop-filter: blur(20px); /* Heavy blur */
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1); /* Thin frost border */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); /* Deep shadow */
}
```

### The "Spotlight" Card Effect
Cards should not be flat. They should react to the mouse.
*   **Behavior**: When the mouse moves over a card, a radial gradient follows the cursor.
*   **Implementation**: Radial Gradient overlay: `radial-gradient(circle 250px at ${x}px ${y}px, rgba(0, 245, 255, 0.15), transparent)`.

### Gradients
*   **Primary Gradient**: Linear 135deg from **Cyber Cyan** to **Electric Purple**.
*   **Usage**: Button backgrounds, Text Gradients (`background-clip: text`), Progress bars.

### Background Ambience
*   **Tech Grid**: A moving background grid (`linear-gradient` of 1px lines) that drifts slowly (`20s` animation).
*   **Particles**: Floating circles with low opacity (0.4) that move upward and scale.
*   **Vignette**: Radial gradient on the body to darken edges.

## 4. Component Library

### Buttons
1.  **Primary (Main CTA)**:
    *   **Shape**: Pill.
    *   **Background**: Gradient (Cyan -> Purple).
    *   **Text**: Black (High contrast) or White (depending on gradient lightness).
    *   **Hover**: Lift (`transform: translateY(-3px)`) and Glow (`box-shadow`).
2.  **Secondary (Outline)**:
    *   **Shape**: Pill.
    *   **Background**: Transparent.
    *   **Border**: 1px solid Gray.
    *   **Hover**: Border becomes Cyan, Text becomes Cyan, Background becomes 5% Cyan.

### Navigation (The "Pill Nav")
*   **Position**: Fixed, floating at top center.
*   **Style**: Glassmorphism Pill.
*   **Links**: Simple text. Active state usually has a glowing underline or highlight.

### Cards (Feature/Product)
*   **Background**: Very dark gradient (almost black).
*   **Border**: 1px solid `rgba(255,255,255,0.1)`.
*   **Hover**: Border turns Cyan. Scale up slightly (`1.02`).
*   **Content**: Icon (Cyan) -> Title (Serif) -> Description (Muted Sans).

## 5. Animation Guidelines
*   **Entrance**: Elements smoothly fade in and slide up (`y: 30px -> 0px`). Stagger children elements.
*   **Hover**: Swift but smooth (`0.3s ease`).
*   **Continuous**: Elements like "blobs" or "shapes" in the background should float/bob slowly (`20s` loop) to make the site feel "alive".

## 6. CSS Best Practices (For AI Generation)
*   **Variables**: ALWAYS use CSS Variables (`--color-cyan`, `--spacing-md`) for consistency.
*   **Responsive**:
    *   **Mobile**: Reduce padding (`2rem`), stack grids (`1fr`), clamp text (`line-clamp: 4`).
    *   **Desktop**: Grid layouts (`repeat(auto-fit, minmax(350px, 1fr))`).
*   **Accessibility**: Ensure Cyan text on Black background has sufficient contrast. Use generic `clamp()` for fonts.

## 7. Prompt Instruction
*To replicate this style, prompt the AI:*
"Build a website with a Cyberpunk/Luxury aesthetic using a deep black background (`#030303`), serif headings (`Playfair Display`), and sans-serif body (`Inter`). Use Neon Cyan (`#00F5FF`) and Purple (`#7000FF`) as primary accents. Implement glassmorphism for all containers (`backdrop-filter: blur(20px)`), pill-shaped buttons with gradients, and interactive cards that glow on hover. Ensure the background has animated tech grids or floating particles."
