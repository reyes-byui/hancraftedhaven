# Typography System

## Font Families

### Primary Font: Playfair Display
- **Type**: Serif
- **Source**: Google Fonts
- **Usage**: Headings (H1-H3), Brand name, Featured product titles
- **Character**: Elegant, high contrast, traditional craftsmanship feel
- **Weights**: 
  - Regular (400)
  - Semi-bold (600)
  - Bold (700)

### Secondary Font: Source Sans Pro
- **Type**: Sans-serif
- **Source**: Google Fonts
- **Usage**: Body text, Navigation, Forms, UI elements
- **Character**: Clean, modern, highly readable
- **Weights**:
  - Regular (400)
  - Medium (500)
  - Semi-bold (600)

### Accent Font: Dancing Script
- **Type**: Script/Handwritten
- **Source**: Google Fonts
- **Usage**: Quotes, Artisan signatures, Special callouts
- **Character**: Personal, handcrafted, artistic touch
- **Weights**:
  - Regular (400)
  - Medium (500)

## Typography Scale

### Headings
```css
h1 {
  font-family: 'Playfair Display', serif;
  font-size: 3rem; /* 48px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

h2 {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem; /* 40px */
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

h3 {
  font-family: 'Playfair Display', serif;
  font-size: 2rem; /* 32px */
  font-weight: 600;
  line-height: 1.3;
}

h4 {
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 1.5rem; /* 24px */
  font-weight: 600;
  line-height: 1.4;
}

h5 {
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 1.25rem; /* 20px */
  font-weight: 500;
  line-height: 1.4;
}

h6 {
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 1.125rem; /* 18px */
  font-weight: 500;
  line-height: 1.4;
}
```

### Body Text
```css
body {
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 1rem; /* 16px */
  font-weight: 400;
  line-height: 1.6;
  color: #8B4513;
}

.large-text {
  font-size: 1.125rem; /* 18px */
  line-height: 1.6;
}

.small-text {
  font-size: 0.875rem; /* 14px */
  line-height: 1.5;
}

.caption {
  font-size: 0.75rem; /* 12px */
  line-height: 1.4;
  color: #8B4513;
  opacity: 0.8;
}
```

### Special Text Styles
```css
.handwritten {
  font-family: 'Dancing Script', cursive;
  font-size: 1.25rem;
  font-weight: 400;
  color: #D2691E;
}

.quote {
  font-family: 'Dancing Script', cursive;
  font-size: 1.5rem;
  font-weight: 400;
  font-style: italic;
  color: #8B4513;
}

.price {
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #D2691E;
}
```

## Responsive Typography

### Mobile (320px - 767px)
```css
h1 { font-size: 2rem; } /* 32px */
h2 { font-size: 1.75rem; } /* 28px */
h3 { font-size: 1.5rem; } /* 24px */
h4 { font-size: 1.25rem; } /* 20px */
body { font-size: 1rem; } /* 16px */
```

### Tablet (768px - 1023px)
```css
h1 { font-size: 2.5rem; } /* 40px */
h2 { font-size: 2rem; } /* 32px */
h3 { font-size: 1.75rem; } /* 28px */
h4 { font-size: 1.375rem; } /* 22px */
body { font-size: 1rem; } /* 16px */
```

### Desktop (1024px+)
```css
h1 { font-size: 3rem; } /* 48px */
h2 { font-size: 2.5rem; } /* 40px */
h3 { font-size: 2rem; } /* 32px */
h4 { font-size: 1.5rem; } /* 24px */
body { font-size: 1rem; } /* 16px */
```

## Font Loading Strategy

### Google Fonts Implementation
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500&family=Playfair+Display:wght@400;600;700&family=Source+Sans+Pro:wght@400;500;600&display=swap" rel="stylesheet">
```

### CSS Font-Face (Local Fallback)
```css
@font-face {
  font-family: 'Playfair Display';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Playfair Display'), url('/fonts/playfair-display.woff2') format('woff2');
}
```

## Accessibility Guidelines

### Contrast Requirements
- All text meets WCAG 2.1 AA contrast ratios
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text (18px+ or 14px+ bold)

### Readability Standards
- Minimum 16px font size for body text
- Line height of 1.5+ for optimal reading
- Adequate letter spacing for dyslexia-friendly design
- No text over busy background images

### Font Weight Guidelines
- Regular (400) for body text
- Medium (500) for emphasis
- Semi-bold (600) for subheadings
- Bold (700) for main headings only

This typography system ensures consistent, readable, and accessible text across the entire Handcrafted Haven platform while maintaining the warm, artisanal brand identity.
