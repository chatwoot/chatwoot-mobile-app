# 🎨 Color System Migration Guide

## Quick Reference

### Before (Radix/Tailwind):

```tsx
import { tailwind } from '@/theme';

<Text style={tailwind.style('text-gray-950')}>Title</Text>
<View style={tailwind.style('bg-gray-100')}>...</View>
```

### After (OceanoTech):

```tsx
import { useThemedStyles } from '@/theme';

const styles = useThemedStyles();

<Text style={styles.textPrimary}>Title</Text>
<View style={styles.bgSecondary}>...</View>
```

---

## Available Themed Styles

```typescript
const styles = useThemedStyles();

// Backgrounds
styles.bgPrimary; // Main background
styles.bgSecondary; // Secondary background
styles.bgInput; // Input backgrounds

// Text
styles.textPrimary; // Main text color
styles.textSecondary; // Secondary text (lighter)
styles.textTertiary; // Tertiary text (even lighter)
styles.textLink; // Link color

// Borders
styles.border; // Border color only
styles.borderStyle; // Border with 1px width
styles.divider; // Divider background

// Sheets/Modals
styles.sheetBg; // Bottom sheet background
styles.sheetIndicator; // Sheet indicator color

// States
styles.stateError; // Error text color

// Buttons
styles.btnPrimary.bg; // Primary button background
styles.btnPrimary.bgPressed; // Pressed state
styles.btnPrimary.bgDisabled; // Disabled state
styles.btnPrimary.text; // Button text
styles.btnPrimary.textDisabled; // Disabled button text

// Helpers
styles.isDark; // Boolean: is dark mode active?
styles.statusBar; // 'light-content' | 'dark-content'
```

---

## Common Migrations

### Text Colors

| Tailwind (Old)  | OceanoTech (New)       |
| --------------- | ---------------------- |
| `text-gray-950` | `styles.textPrimary`   |
| `text-gray-900` | `styles.textSecondary` |
| `text-gray-700` | `styles.textSecondary` |
| `text-gray-600` | `styles.textTertiary`  |
| `text-blue-600` | `styles.textLink`      |

### Background Colors

| Tailwind (Old)            | OceanoTech (New)     |
| ------------------------- | -------------------- |
| `bg-white` / `bg-gray-50` | `styles.bgPrimary`   |
| `bg-gray-100`             | `styles.bgSecondary` |
| `bg-blue-50`              | `styles.bgInput`     |

### Border Colors

| Tailwind (Old)    | OceanoTech (New) |
| ----------------- | ---------------- |
| `border-gray-200` | `styles.divider` |
| `border-gray-300` | `styles.border`  |

---

## Step-by-Step Migration

### 1. Import the hook

```tsx
import { useThemedStyles } from '@/theme';
```

### 2. Call it in your component

```tsx
const MyComponent = () => {
  const styles = useThemedStyles();
  // ...
};
```

### 3. Replace Tailwind color classes

**Before:**

```tsx
<Text style={tailwind.style('text-base text-gray-950 font-inter-420-20')}>Hello</Text>
```

**After:**

```tsx
<Text style={[tailwind.style('text-base font-inter-420-20'), styles.textPrimary]}>Hello</Text>
```

### 4. Combine with Tailwind when needed

```tsx
// Keep Tailwind for layout/spacing
// Use themed styles for colors
<View style={[
  tailwind.style('flex-1 px-4 py-2'),  // Layout
  styles.bgPrimary                       // Color (themed)
]}>
```

---

## Adding New Colors

If you need a color that doesn't exist:

### 1. Add to `colors/index.ts`

```typescript
export const THEME_COLORS = {
  light: {
    // ... existing colors
    myNewColor: '#FF0000',
  },
  dark: {
    // ... existing colors
    myNewColor: '#00FF00',
  },
};
```

### 2. Export in `useThemedStyles.ts`

```typescript
return {
  // ... existing styles
  myNewColor: { color: colors.myNewColor },
};
```

### 3. Use in components

```tsx
<Text style={styles.myNewColor}>Colored text</Text>
```

---

## When NOT to Migrate

**Leave these as Tailwind (for now):**

- Alpha/transparency colors: `blackA-A3`, `whiteA-A6`
- Utility classes: `flex`, `gap-4`, `px-6`, `rounded-xl`
- Font styles: `font-inter-420-20`, `text-base`
- Layout: `flex-row`, `justify-between`, `items-center`

**Only migrate COLOR-related classes.**

---

## Testing After Migration

1. **Light mode**: Check colors look correct
2. **Dark mode**: Toggle theme in settings → verify colors adapt
3. **System theme**: Set to "System" → change device theme → verify it follows

---

## Questions?

Check the color system documentation:

- `src/theme/colors/README.md` - Architecture overview
- `src/theme/colors/index.ts` - Color definitions
- `src/theme/useThemedStyles.ts` - Hook implementation
