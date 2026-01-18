# UI Consistency Skill

**Skill Type**: Frontend Design & User Experience
**Reusability**: Phase II-N, Phase III, all future phases

## Purpose

Maintain consistent UI/UX across all screens with unified design system, responsive layouts, and smooth interactions.

## Capabilities

1. **Design System**
   - Consistent color palette (neon-cyan, neon-magenta, neon-purple)
   - Consistent typography (Inter font, size hierarchy)
   - Consistent spacing (4px/8px grid system)
   - Consistent border radius, shadows, transitions

2. **Component Patterns**
   - Card component with dark theme and hover effects
   - Button components (primary, secondary, danger)
   - Input components with dark theme and focus states
   - Loading skeletons and spinners
   - Modal/Dialog components for forms

3. **Responsive Design**
   - Mobile-first approach (320px baseline)
   - Breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px)
   - Flexible layouts using Flexbox and Grid
   - Touch-friendly targets (min 44x44px on mobile)

4. **Animations & Transitions**
   - Fade-in animations (200-300ms)
   - Slide-up animations for cards
   - Hover effects (scale, shadow, border glow)
   - Loading states with spinners or skeletons
   - Smooth page transitions

## Usage Pattern

```typescript
// Consistent card component
<div className="card-dark p-6 hover:shadow-neon-cyan transition-all">
  <h3 className="text-xl font-bold mb-3">{title}</h3>
  <p className="text-gray-400">{description}</p>
</div>

// Consistent button component
<button className="btn-neon btn-primary">
  {label}
</button>
```

## Design Tokens

```typescript
// Colors
colors: {
  neon: {
    cyan: '#00f3ff',
    magenta: '#ff00ff',
    purple: '#bd00ff',
  },
  dark: {
    bg: '#0a0a0f',
    surface: '#12121a',
    border: '#1e1e2e',
  }
}

// Spacing
spacing: {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
}

// Transitions
transition: 'all 200ms ease-in-out'
```

## Best Practices

- Always use design tokens (no hardcoded colors)
- Always test on mobile, tablet, desktop
- Always add loading states for async operations
- Always provide visual feedback (hover, focus, active)
- Always maintain contrast ratio (WCAG AA compliant)

## Component Checklist

- [ ] Consistent padding and margins
- [ ] Consistent border radius (8px or 12px)
- [ ] Consistent font sizes (h1-h6, body, small)
- [ ] Consistent colors (primary, secondary, danger)
- [ ] Hover effects on interactive elements
- [ ] Focus states for keyboard navigation
- [ ] Loading states for async operations
- [ ] Error states with clear messages
- [ ] Empty states with illustrations
- [ ] Responsive layout at all breakpoints

## Exit Criteria

UI is consistent across all screens, responsive on all devices, smooth transitions, professional SaaS-grade appearance.
