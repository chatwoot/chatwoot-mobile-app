# Color System Architecture

## 📐 Dual System (Migration in Progress)

This project currently has **TWO color systems** running in parallel:

### 🎨 System 1: **Radix UI Colors** (Legacy - Tailwind Static)

- Used by: Tailwind classes (`gray-950`, `blue-600`, etc.)
- Files: `light.ts`, `dark.ts`, `blackA.ts`, `whiteA.ts`
- Status: ⚠️ **Being phased out gradually**

### 🎨 System 2: **OceanoTech Colors** (New - Dynamic Theming) ⭐

- Used by: `useThemedStyles()` hook
- Files: `brand.ts`, `semantic.ts`, `colors/index.ts`
- Status: ✅ **Active - Use this for new components**

```
┌─────────────────────────────────────────────────┐
│  LEGACY SYSTEM (Radix UI)                      │
├─────────────────────────────────────────────────┤
│  light.ts, dark.ts, blackA.ts, whiteA.ts       │
│           ↓                                      │
│  tailwind.config.ts                             │
│           ↓                                      │
│  Components using Tailwind classes              │
│  (Message, Filters, etc.)                       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  NEW SYSTEM (OceanoTech) ⭐                     │
├─────────────────────────────────────────────────┤
│  semantic.ts + brand.ts                         │
│           ↓                                      │
│  colors/index.ts (SINGLE SOURCE OF TRUTH)       │
│           ↓                                      │
│  useThemedStyles()                              │
│           ↓                                      │
│  Components with dynamic theming                │
│  (LoginScreen, ThemeList, etc.)                 │
└─────────────────────────────────────────────────┘
```

## 📚 File Structure

### `brand.ts` + `semantic.ts`

- Design system color tokens
- Used by Tailwind (via `tailwind.config.ts`)
- **NOT directly used by components**

### `colors/index.ts` ⭐

- **THE SINGLE SOURCE OF TRUTH**
- Maps semantic colors to light/dark themes
- Exports `THEME_COLORS` object

### `useThemedStyles.ts`

- React hook that consumes `THEME_COLORS`
- Returns styled objects for components
- Handles light/dark mode switching

## 🎨 Usage in Components

```typescript
import { useThemedStyles } from '@/theme';

const MyComponent = () => {
  const styles = useThemedStyles();

  return (
    <View style={styles.bgPrimary}>
      <Text style={styles.textPrimary}>Hello</Text>
      <Text style={styles.textSecondary}>World</Text>
      <Text style={styles.textTertiary}>!</Text>
    </View>
  );
};
```

## 🔧 Adding New Colors

1. **Add to `colors/index.ts`:**

   ```typescript
   export const THEME_COLORS = {
     light: {
       myNewColor: '#FF0000',
     },
     dark: {
       myNewColor: '#00FF00',
     },
   };
   ```

2. **Add to `useThemedStyles.ts`:**

   ```typescript
   return {
     myNewColor: { color: colors.myNewColor },
   };
   ```

3. **Use in component:**
   ```typescript
   <Text style={styles.myNewColor}>Colored text</Text>
   ```

## ✅ Benefits

- **Single source of truth**: All colors defined in one place
- **Type-safe**: TypeScript ensures color consistency
- **Easy theming**: Change colors in `colors/index.ts` → reflects everywhere
- **No duplication**: Design tokens reused across light/dark
- **Maintainable**: Clear architecture, easy to understand

## 🚀 Migration Strategy

We're **gradually migrating** from Radix UI colors to OceanoTech colors:

### When working on a component:

1. **New components**: Always use `useThemedStyles()` from the start
2. **Existing components**:
   - If you're making changes → migrate to `useThemedStyles()`
   - If it works and you're not touching it → leave it as is

### Example Migration:

**Before (Radix/Tailwind):**

```tsx
<Text style={tailwind.style('text-gray-950')}>Hello</Text>
```

**After (OceanoTech):**

```tsx
const styles = useThemedStyles();
<Text style={styles.textPrimary}>Hello</Text>;
```

## ⚠️ Important Rules

1. **NEVER hardcode colors** in components
2. **FOR NEW CODE**: Always use `useThemedStyles()` for dynamic colors
3. **FOR LEGACY CODE**: Migrate to `useThemedStyles()` when you touch it
4. **UPDATE `colors/index.ts`** when adding new theme colors
5. **DON'T modify** `semantic.ts` or `brand.ts` (they're the design system)

## 📊 Migration Status

**Migrated Components:**

- ✅ LoginScreen
- ✅ ThemeList

**To Migrate (when touched):**

- ⏳ Message components
- ⏳ Conversation screens
- ⏳ Chat screens
- ⏳ Settings screens
- ⏳ And more...

---

Last updated: 2026-01-01
