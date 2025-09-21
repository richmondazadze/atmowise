# Sponsors Directory

This directory contains sponsor logos and assets for the AtmoWise application.

## File Structure
```
public/sponsors/
├── README.md (this file)
├── logo.wepb (main sponsor logo)
├── logo.svg (vector version)
└── logo-dark.png (dark theme version)
```

## Logo Specifications

### Main Logo (logo.wepb)
- **Format**: PNG with transparent background
- **Dimensions**: 200x60px (recommended)
- **Aspect Ratio**: 3.33:1 (landscape)
- **Background**: Transparent
- **File Size**: < 50KB

### Vector Logo (logo.svg)
- **Format**: SVG
- **Dimensions**: Scalable
- **Background**: Transparent
- **Optimized**: For web use

### Dark Theme Logo (logo-dark.png)
- **Format**: PNG with transparent background
- **Dimensions**: 200x60px (recommended)
- **Background**: Transparent
- **Colors**: Optimized for dark backgrounds

## Usage in Code

The sponsor logo will be automatically loaded from this directory:

```tsx
// In SponsorSection component
<img 
  src="/sponsors/logo.wepb" 
  alt="Sponsor Logo" 
  className="h-8 w-auto"
/>
```

## Adding New Sponsor Logos

1. Add the logo files to this directory
2. Update the `SponsorSection.tsx` component to reference the new logo
3. Ensure the logo follows the specifications above
4. Test on both light and dark themes

## File Naming Convention

- `logo.wepb` - Main logo
- `logo.svg` - Vector version
- `logo-dark.png` - Dark theme version
- `logo-[sponsor-name].png` - Additional sponsor logos
