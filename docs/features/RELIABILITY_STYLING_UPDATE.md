# Reliability Dashboard - Mission Control Theme Update

## Summary

Updated all card styles in the Reliability Dashboard to match the Mission Control dark theme aesthetic with cyan accents.

## Styling Changes

### Color Palette
- **Background**: Dark theme (`#0f1419`, `#1a1f2e`)
- **Primary Accent**: Cyan (`#00d4ff`)
- **Status Colors**:
  - Critical: Red (`#ef4444`)
  - Warning: Amber (`#fbbf24`)
  - Success: Green (`#10b981`)
  - Normal: Cyan (`#00d4ff`)

### Updated Components

#### 1. Main Dashboard Page (`app/dashboard/reliability/page.tsx`)
- **Header**: Cyan title with uppercase font-mono styling, gray-400 description
- **Summary Cards**: Mission Control card styling with glowing effects for critical states
  - Avg Reschedule Rate: Cyan border with hover effect
  - Critical Tutors: Red border with glow-critical effect
  - High Risk Tutors: Amber border with glow-warning effect
  - Risky Sessions: Yellow border
- **View Buttons**: Cyan active state with ghost inactive state
- **Tables**: Dark background (`#1a1f2e`) with cyan borders, mono font for data
- **Badges**: Transparent backgrounds with colored borders (20% opacity backgrounds)
- **Correlation Cards**: Dark nested cards with hover effects

#### 2. Reliability Heatmap (`components/dashboard/reliability-heatmap.tsx`)
- **Card**: Mission Control styling with cyan-500/30 border
- **Heatmap Cells**: Color-coded with borders and glow effects:
  - 30%+: Red with glow-critical
  - 20-30%: Red
  - 15-20%: Amber with glow-warning
  - 10-15%: Yellow/80
  - 5-10%: Yellow-600/60
  - 0-5%: Green-600/40
- **Text**: Cyan headings, mono font for percentages
- **Legend**: Cyan text with dark backgrounds

#### 3. No-Show Risk Card (`components/dashboard/noshow-risk-card.tsx`)
- **Card**: Mission Control styling
- **Risk Cards**: Nested dark cards (`#1a1f2e`) with cyan border hover effects
- **Risk Badges**: Transparent with colored borders matching risk level
- **Historical Context**: Darker nested background (`#0f1419`)
- **Mitigation Box**: Cyan background at 10% opacity
- **Action Button**: Cyan border with cyan text

### Design Patterns Applied

1. **Mission Card**: `mission-card` class for gradient background with dark borders
2. **Mission Card Glow**: `mission-card-glow` for important highlighted cards
3. **Glow Effects**: `glow-critical` and `glow-warning` for visual emphasis
4. **Transparency**: Using `/20`, `/30`, `/50` opacity modifiers for depth
5. **Mono Font**: Applied to all numeric data for technical aesthetic
6. **Hover States**: Cyan accent on hover (`hover:border-cyan-500/40`)

### CSS Classes Used
- `mission-card`: Base card styling
- `mission-card-glow`: Card with cyan glow effect
- `glow-critical`: Red glowing shadow
- `glow-warning`: Amber glowing shadow
- `glow-success`: Green glowing shadow
- `table-compact`: Compact table styling
- Custom color utilities: `text-cyan-400`, `border-cyan-500/30`, etc.

## Visual Hierarchy

1. **Critical Information**: Red with glow effects
2. **Important Warnings**: Amber/yellow with optional glow
3. **Normal/Success**: Cyan/green accents
4. **Background Layers**:
   - Base: `#0a0e1a`
   - Card: `#0f1419`
   - Nested: `#1a1f2e`

## Accessibility

- Maintained high contrast ratios with light text on dark backgrounds
- Color-coded indicators supplemented with text labels
- Mono font improves readability of numeric data
- Hover states provide clear interaction feedback

## Consistency

All components now match the Mission Control theme seen in:
- Navigation bar
- Alerts page
- Other dashboard sections

The dark theme with cyan accents creates a cohesive, technical, command-center aesthetic throughout the reliability analysis interface.

