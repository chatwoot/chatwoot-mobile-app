# Unified Theme System

This directory contains the unified theme system for the Chatwoot mobile application, designed to ensure visual consistency with the web application while providing an excellent user experience across both light and dark modes.

## Overview

The unified theme system provides:
- **Visual Consistency**: Identical appearance across web and mobile platforms
- **Theme Switching**: Seamless light/dark mode transitions
- **Semantic Colors**: Meaningful color names that adapt to themes
- **Type Safety**: Full TypeScript support for all theme properties
- **Performance**: Optimized theme switching with memoization

## Architecture

### Core Components

```
src/theme/
├── colors/
│   ├── unified.ts          # Unified color definitions
│   ├── semantic.ts         # Semantic color mappings
│   ├── light.ts           # Light theme colors (legacy)
│   ├── dark.ts            # Dark theme colors (legacy)
│   ├── blackA.ts          # Black with alpha variations
│   └── whiteA.ts          # White with alpha variations
├── components/
│   ├── ThemeProvider.tsx  # Theme context provider
│   ├── createTheme.ts     # Theme creation utility
│   ├── useTheme.ts        # Theme hook
│   └── ExampleComponent.tsx # Usage examples
├── tailwind.config.ts     # Tailwind configuration
└── index.ts               # Main exports
```

### Color System

The unified theme system uses a 12-step color scale that matches the web application:

```typescript
interface ColorScale1to12 {
  1: string;   // Darkest
  2: string;
  3: string;
  // ... 
  12: string;  // Lightest
}
```

#### Color Families

- **Slate**: Neutral grays for backgrounds and text
- **Iris**: Primary brand colors
- **Blue**: Accent and info colors
- **Ruby**: Error and destructive colors
- **Amber**: Warning colors
- **Teal**: Success colors
- **Gray**: Additional neutral colors

#### Semantic Colors

Semantic colors provide meaningful names that automatically adapt to the current theme:

```typescript
interface SemanticColors {
  // Backgrounds
  background: string;           // Main app background
  surface: string;              // Card/container backgrounds
  surfaceElevated: string;      // Elevated surfaces
  
  // Text
  textPrimary: string;         // Primary text
  textSecondary: string;       // Secondary text
  textMuted: string;           // Muted text
  
  // Interactive
  primary: string;             // Primary brand color
  accent: string;              // Accent color
  success: string;             // Success state
  warning: string;             // Warning state
  error: string;               // Error state
  
  // Borders
  border: string;              // Default borders
  borderStrong: string;        // Strong borders
  borderWeak: string;          // Subtle borders
}
```

## Usage

### Basic Theme Usage

```typescript
import { useTheme } from '@/context';

const MyComponent = () => {
  const { tailwind, isDark, toggleTheme } = useTheme();
  
  return (
    <View style={tailwind.style('bg-background p-4')}>
      <Text style={tailwind.style('text-foreground')}>
        Hello World
      </Text>
      <TouchableOpacity 
        style={tailwind.style('bg-primary px-4 py-2 rounded')}
        onPress={toggleTheme}
      >
        <Text style={tailwind.style('text-white')}>
          Toggle Theme
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Advanced Theme Usage

```typescript
import { useTheme } from '@/context';

const AdvancedComponent = () => {
  const { tailwind, colors, semanticColors, isDark } = useTheme();
  
  // Access raw color values
  const primaryColor = colors.iris[9];
  const backgroundColor = semanticColors.background;
  
  // Use theme-aware styling
  const containerStyle = tailwind.style(
    'bg-surface border border-border rounded-lg p-4',
    isDark ? 'shadow-lg' : 'shadow-sm'
  );
  
  return (
    <View style={containerStyle}>
      <Text style={tailwind.style('text-foreground text-lg font-semibold')}>
        Advanced Component
      </Text>
    </View>
  );
};
```

### Theme Provider Setup

The theme provider is already set up in the main app:

```typescript
// App.tsx
import { ThemeProvider } from '@/context';

export default function App() {
  return (
    <ThemeProvider>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

## Color Usage Guidelines

### Background Hierarchy

```typescript
// Primary backgrounds
'bg-background'     // Main app background
'bg-surface'        // Card/container backgrounds
'bg-surface-elevated' // Elevated surfaces (modals, dropdowns)

// Interactive backgrounds
'bg-primary'        // Primary actions
'bg-accent'         // Secondary actions
'bg-destructive'    // Destructive actions
```

### Text Hierarchy

```typescript
// Text colors
'text-foreground'   // Primary text
'text-secondary'    // Secondary text
'text-muted'        // Muted/disabled text
'text-primary'      // Brand text
'text-accent'       // Accent text
```

### Border Usage

```typescript
// Border colors
'border-border'     // Default borders
'border-strong'     // Strong borders
'border-primary'    // Primary borders
'border-destructive' // Error borders
```

## Component Examples

### Message Bubble

```typescript
const MessageBubble = ({ isOutgoing, message }) => {
  const { tailwind } = useTheme();
  
  return (
    <View style={tailwind.style(
      'px-4 py-3 rounded-lg max-w-[80%] mb-2',
      isOutgoing 
        ? 'bg-primary ml-auto' 
        : 'bg-surface border border-border'
    )}>
      <Text style={tailwind.style(
        'text-sm',
        isOutgoing ? 'text-white' : 'text-foreground'
      )}>
        {message}
      </Text>
    </View>
  );
};
```

### Button Component

```typescript
const Button = ({ title, variant = 'primary', onPress }) => {
  const { tailwind } = useTheme();
  
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary';
      case 'secondary':
        return 'bg-surface border border-border';
      case 'destructive':
        return 'bg-destructive';
      default:
        return 'bg-primary';
    }
  };
  
  return (
    <TouchableOpacity
      style={tailwind.style('px-4 py-3 rounded-lg items-center', getButtonStyles())}
      onPress={onPress}
    >
      <Text style={tailwind.style('text-sm font-medium text-white')}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
```

## Migration Guide

### From Legacy Theme System

1. **Replace color references**:
   ```typescript
   // Old
   'text-gray-950'
   'bg-gray-100'
   
   // New
   'text-foreground'
   'bg-surface'
   ```

2. **Update theme hooks**:
   ```typescript
   // Old
   const themedTailwind = useThemedStyles();
   const { isDark } = useTheme();
   
   // New
   const { tailwind, isDark } = useTheme();
   ```

3. **Use semantic colors**:
   ```typescript
   // Old
   stroke={isDark ? '#FFFFFF' : '#000000'}
   
   // New
   stroke={tailwind.color('text-foreground')}
   ```

### Best Practices

1. **Use semantic colors** instead of hardcoded values
2. **Leverage theme-aware styling** for automatic adaptation
3. **Test both light and dark modes** during development
4. **Use consistent spacing** with the defined scale
5. **Follow the color hierarchy** for proper visual structure

## Testing

### Visual Regression Testing

The theme system includes comprehensive testing utilities:

```typescript
import { ThemeDemo } from '@/components-next/theme';

// Use ThemeDemo component to test all theme variations
<ThemeDemo />
```

### Manual Testing

1. **Theme Switching**: Test smooth transitions between light/dark modes
2. **Color Consistency**: Verify colors match the web application
3. **Accessibility**: Test with screen readers and high contrast modes
4. **Performance**: Ensure theme switching is performant

## Troubleshooting

### Common Issues

1. **Colors not updating**: Ensure you're using the theme-aware `tailwind` instance
2. **Type errors**: Make sure to import the correct theme types
3. **Performance issues**: Check for unnecessary re-renders in theme-dependent components

### Debug Mode

Enable theme debugging by adding this to your component:

```typescript
const { tailwind, isDark, colors, semanticColors } = useTheme();

console.log('Current theme:', { isDark, colors, semanticColors });
```

## Future Enhancements

- **Custom Themes**: Support for additional theme variants
- **Theme Persistence**: Save user theme preferences
- **Advanced Animations**: Smooth theme transition animations
- **Accessibility**: Enhanced support for accessibility features

## Contributing

When adding new theme features:

1. **Follow the existing patterns** for color definitions
2. **Add TypeScript types** for all new properties
3. **Update documentation** with usage examples
4. **Test thoroughly** in both light and dark modes
5. **Ensure consistency** with the web application

## Resources

- [Web Application Colors](./docs/ignore/dark-mode.md)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Native Styling](https://reactnative.dev/docs/style)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
