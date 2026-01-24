# Premium Section Transitions

## Overview
Ultra-smooth, premium transitions between landing page sections that maintain brand colors while creating a seamless, continuous scroll experience.

## Color Flow
```
Cream (Hero) 
  ↓ gradient transition
Pink (Features)
  ↓ gradient transition
Blue (How It Works)
  ↓ gradient transition
Pink (Flowing Menu)
  ↓ gradient transition
Cream (CTA)
  ↓ no transition
Black (Footer - distinctive)
```

## Implementation

### 1. SectionTransition Component
Located: `components/ui/section-transition.tsx`

Creates smooth gradient transitions between sections:
```tsx
<SectionTransition 
  from="oklch(0.97 0.01 90)"  // cream
  to="oklch(0.92 0.04 350)"   // pink
/>
```

**Props:**
- `from`: Starting color (oklch format)
- `to`: Ending color (oklch format)
- `height`: Transition height in pixels (default: 140px)

### 2. Section Styling
All sections use the `.section` class for:
- Soft inset shadows (depth without borders)
- Consistent positioning
- Seamless flow

### 3. Premium Features

**Noise Overlay:**
- Subtle texture applied globally via `body::before`
- Creates cohesive, premium feel
- Opacity: 0.03 with overlay blend mode

**Smooth Scrolling:**
- Native smooth scroll behavior
- No jarring jumps
- Consistent padding using `clamp()`

**Soft Shadows:**
- Inset highlights and shadows
- No visible borders
- Creates depth perception

### 4. Optional: Curve Dividers
Located: `components/ui/curve-divider.tsx`

For even more premium feel, add SVG curves:
```tsx
<CurveDivider 
  color="oklch(0.92 0.04 350)" 
  position="bottom"
/>
```

## Color Reference
```css
--cream: oklch(0.97 0.01 90)
--pink: oklch(0.92 0.04 350)
--blue: oklch(0.92 0.05 230)
--red: oklch(0.55 0.2 25)
--foreground: oklch(0.15 0 0)
```

## Quality Standards
✅ Transitions feel continuous while scrolling
✅ No visible hard edges
✅ No color banding
✅ Comparable to Stripe/Linear/Notion
✅ Smooth on desktop and mobile
✅ Brand colors preserved exactly

## Usage in Landing Page
See `app/page.tsx` for complete implementation with all transitions properly placed between sections.
