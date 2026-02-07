# 🎨 SolarGuard 3D - NASA Color Palette Reference

## Mission Control Color System

This document provides quick reference for all colors used in the NASA-level mission control interface.

---

## 🌌 Background Colors

### Deep Space (Primary Backgrounds)
```css
--space-900: #0a0e27    /* Main body background */
--space-800: #0d1117    /* Panel backgrounds (mission-panel) */
--space-700: #161b22    /* Secondary panel backgrounds */
```

**Usage**:
- `space-900`: Body background, main viewport
- `space-800`: Mission control panels, cards
- `space-700`: Nested containers, table rows

**Visual**: Very dark blue-black with subtle variations

---

## 💠 Accent Colors (Neon Cyber Theme)

### Cyan (Primary Accent)
```css
--cyber-cyan: #00d9ff         /* Primary borders, text highlights */
--cyber-cyan-bright: #00ffff  /* Hover states, active elements */
```

**Usage**:
- Borders on mission panels
- Data value text color
- Graph stroke colors
- Active navigation indicators
- Ticker text

**Visual**: Bright electric cyan with neon glow

### Electric Blue (Secondary Accent)
```css
--cyber-blue: #4d7cff  /* Blue accents, links */
```

**Usage**:
- Secondary highlights
- Link colors
- Alternative graph colors
- Subsystem indicators

**Visual**: Bright electric blue

### Cyber Green (Success/Healthy)
```css
--cyber-green: #00ff88  /* Success states, healthy status */
```

**Usage**:
- "Connected" indicators
- Healthy satellite status (80-100% health)
- Success messages
- Positive trend indicators

**Visual**: Bright neon green

### Cyber Amber (Warning)
```css
--cyber-amber: #ffb020  /* Warning states */
```

**Usage**:
- Degraded satellite status (60-79% health)
- Warning alerts
- ELEVATED threat level
- Caution indicators

**Visual**: Bright amber/orange

### Cyber Red (Danger/Critical)
```css
--cyber-red: #ff4444      /* Danger states, critical alerts */
--cyber-red-bright: #ff6b35  /* Severe warnings */
```

**Usage**:
- Critical satellite status (<40% health)
- Severe threat level
- Error messages
- Disconnection indicators

**Visual**: Bright red-orange with urgency

---

## 📝 Text Colors

### Primary Text
```css
--space-50: #c9d1d9   /* Main text color */
```

**Usage**:
- Body text
- Labels
- Descriptions
- General content

**Visual**: Light gray-white (high contrast on dark backgrounds)

### Data Values (Monospace)
```css
color: #00ffff         /* Cyan bright */
text-shadow: 0 0 10px rgba(0, 255, 255, 0.5)
font-family: 'Roboto Mono', 'Courier New', monospace
```

**Usage**:
- Numeric values
- Parameters (speed, Bz, Kp, etc.)
- Time displays
- Satellite IDs

**Visual**: Glowing cyan monospace (like mission control terminals)

### Headers (Display Font)
```css
color: #00d9ff  /* Cyber cyan */
font-family: 'Orbitron', 'Space Grotesk', sans-serif
```

**Usage**:
- Component titles
- Section headers
- Page titles
- Navigation items (active)

**Visual**: Bold, futuristic, uppercase styling

---

## 🎯 Threat Level Colors

### NOMINAL (Green)
```css
background: linear-gradient(135deg, #00ff88 0%, #00d9ff 100%)
border-color: #00ff88
text-color: #0a0e27 (dark on bright)
```

**Conditions**: Kp < 3, Bz > -5, Speed < 500 km/s

### ELEVATED (Yellow/Amber)
```css
background: linear-gradient(135deg, #ffb020 0%, #ffd700 100%)
border-color: #ffb020
text-color: #0a0e27
```

**Conditions**: 3 ≤ Kp < 5, -10 < Bz ≤ -5, 500 ≤ Speed < 600 km/s

### HIGH (Orange)
```css
background: linear-gradient(135deg, #ff6b35 0%, #ffb020 100%)
border-color: #ff6b35
text-color: #ffffff
```

**Conditions**: 5 ≤ Kp < 7, -15 < Bz ≤ -10, 600 ≤ Speed < 800 km/s

### SEVERE (Red)
```css
background: linear-gradient(135deg, #ff4444 0%, #ff0000 100%)
border-color: #ff4444
text-color: #ffffff
```

**Conditions**: Kp ≥ 7, Bz ≤ -15, Speed ≥ 800 km/s

---

## 🛰️ Satellite Health Colors

### Healthy (80-100%)
```css
background: rgba(0, 255, 136, 0.1)
border-color: #00ff88
text-color: #00ff88
bar-color: linear-gradient(to right, #00ff88, #00d9ff)
```

### Degraded (60-79%)
```css
background: rgba(255, 176, 32, 0.1)
border-color: #ffb020
text-color: #ffb020
bar-color: linear-gradient(to right, #ffb020, #ffd700)
```

### Warning (40-59%)
```css
background: rgba(255, 107, 53, 0.1)
border-color: #ff6b35
text-color: #ff6b35
bar-color: linear-gradient(to right, #ff6b35, #ffb020)
```

### Critical (<40%)
```css
background: rgba(255, 68, 68, 0.1)
border-color: #ff4444
text-color: #ff4444
bar-color: linear-gradient(to right, #ff4444, #ff0000)
```

---

## 📊 Graph Colors

### Scientific Graphs (Recharts)

#### Bz (Magnetic Field)
```css
stroke: #00d9ff  /* Cyan */
fill: url(#colorBz)  /* Gradient: rgba(0,217,255,0.2) → rgba(0,217,255,0.05) */
```

#### Solar Wind Speed
```css
stroke: #4d7cff  /* Electric blue */
fill: url(#colorSpeed)  /* Gradient: rgba(77,124,255,0.2) → rgba(77,124,255,0.05) */
```

#### Proton Density
```css
stroke: #00ff88  /* Cyber green */
fill: url(#colorDensity)  /* Gradient: rgba(0,255,136,0.2) → rgba(0,255,136,0.05) */
```

#### Temperature
```css
stroke: #ffb020  /* Cyber amber */
fill: url(#colorTemp)  /* Gradient: rgba(255,176,32,0.2) → rgba(255,176,32,0.05) */
```

#### Danger Threshold Line
```css
stroke: #ff4444  /* Cyber red */
stroke-dasharray: 5,5
stroke-width: 2
```

---

## 🎨 Special Effects

### Glass-Morphism Panel
```css
background: rgba(10, 14, 39, 0.7)
backdrop-filter: blur(20px)
border: 1px solid rgba(0, 217, 255, 0.2)
box-shadow: 
  0 8px 32px 0 rgba(0, 0, 0, 0.37),
  inset 0 0 0 1px rgba(0, 217, 255, 0.1)
```

### Mission Control Panel
```css
background: linear-gradient(135deg, rgba(13,17,23,0.95) 0%, rgba(10,14,39,0.95) 100%)
backdrop-filter: blur(20px)
border: 1px solid rgba(0, 217, 255, 0.3)
box-shadow: 
  0 0 20px rgba(0, 217, 255, 0.1),
  inset 0 0 20px rgba(0, 217, 255, 0.05)
```

### Neon Glow Effects

#### Cyan Glow
```css
box-shadow: 0 0 10px rgba(0, 217, 255, 0.5), 0 0 20px rgba(0, 217, 255, 0.3)
```

#### Blue Glow
```css
box-shadow: 0 0 10px rgba(77, 124, 255, 0.5), 0 0 20px rgba(77, 124, 255, 0.3)
```

#### Amber Glow
```css
box-shadow: 0 0 10px rgba(255, 176, 32, 0.5), 0 0 20px rgba(255, 176, 32, 0.3)
```

#### Red Glow
```css
box-shadow: 0 0 10px rgba(255, 68, 68, 0.5), 0 0 20px rgba(255, 68, 68, 0.3)
```

### Text Shadow (Data Values)
```css
text-shadow: 0 0 10px rgba(0, 255, 255, 0.5)
```

---

## 🌐 Radar Grid Background

```css
background: #0a0e27
background-image: 
  radial-gradient(circle at 25% 25%, rgba(0, 217, 255, 0.03) 0%, transparent 50%),
  radial-gradient(circle at 75% 75%, rgba(77, 124, 255, 0.03) 0%, transparent 50%),
  repeating-linear-gradient(0deg, rgba(0, 217, 255, 0.03) 0px, transparent 1px, transparent 40px),
  repeating-linear-gradient(90deg, rgba(0, 217, 255, 0.03) 0px, transparent 1px, transparent 40px)
background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px
```

**Result**: Subtle radar grid pattern with corner glows

---

## 🎯 Usage Guidelines

### Do's ✅
- Use `cyber-cyan` for primary interactive elements
- Apply glow effects to important data values
- Keep backgrounds dark (`space-900`, `space-800`)
- Use color-coded health indicators consistently
- Add glass-morphism to panels for depth
- Use monospace fonts for numeric data

### Don'ts ❌
- Don't mix too many accent colors in one component
- Don't use bright colors for large backgrounds (eye strain)
- Don't use low-contrast text (keep accessibility in mind)
- Don't overuse glow effects (loses impact)
- Don't use pure white (#ffffff) for text (too harsh)

---

## 📱 Responsive Adjustments

### Mobile/Tablet
- Reduce glow intensities by 50%
- Simplify gradients for performance
- Use solid colors instead of blur effects when needed
- Increase touch target sizes (min 44px)

### Desktop/Large Screens
- Full glow effects
- Multiple layered backgrounds
- Complex glass-morphism
- Subtle animations and transitions

---

## 🔧 Tailwind CSS Utility Classes

```javascript
// In tailwind.config.js
colors: {
  space: {
    900: '#0a0e27',
    800: '#0d1117',
    700: '#161b22',
    50: '#c9d1d9',
  },
  cyber: {
    cyan: '#00d9ff',
    'cyan-bright': '#00ffff',
    blue: '#4d7cff',
    green: '#00ff88',
    amber: '#ffb020',
    red: '#ff4444',
    'red-bright': '#ff6b35',
  }
}
```

**Usage in JSX**:
```tsx
<div className="bg-space-800 text-space-50 border border-cyber-cyan">
  <h2 className="text-cyber-cyan font-display text-2xl">Title</h2>
  <p className="data-value text-cyber-cyan-bright font-mono">450 km/s</p>
</div>
```

---

## 🎨 Quick Color Picker

Copy these for use in design tools:

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Space 900 | `#0a0e27` | `10, 14, 39` | Main background |
| Space 800 | `#0d1117` | `13, 17, 23` | Panel background |
| Cyber Cyan | `#00d9ff` | `0, 217, 255` | Primary accent |
| Cyan Bright | `#00ffff` | `0, 255, 255` | Data values |
| Cyber Blue | `#4d7cff` | `77, 124, 255` | Secondary accent |
| Cyber Green | `#00ff88` | `0, 255, 136` | Success/Healthy |
| Cyber Amber | `#ffb020` | `255, 176, 32` | Warning |
| Cyber Red | `#ff4444` | `255, 68, 68` | Danger/Critical |
| Space 50 | `#c9d1d9` | `201, 209, 217` | Text color |

---

## 🖼️ Visual Examples

### Mission Panel
```tsx
<div className="mission-panel p-6 hover-lift">
  <h3 className="text-cyber-cyan font-display uppercase">Component Title</h3>
  <p className="data-value mt-2">450 km/s</p>
  <p className="text-space-50 text-sm">Solar Wind Speed</p>
</div>
```

**Result**: Dark panel with cyan border, blue blur, neon glow on hover

### Status Indicator
```tsx
<div className="flex items-center space-x-2">
  <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
  <span className="text-cyber-green font-mono text-xs uppercase">
    System Operational
  </span>
</div>
```

**Result**: Pulsing green dot with matching text

### Threat Banner
```tsx
<div className="bg-gradient-to-r from-cyber-amber to-yellow-400 px-6 py-4">
  <span className="text-space-900 font-display font-bold uppercase">
    Threat Level: ELEVATED
  </span>
</div>
```

**Result**: Amber gradient banner with dark text

---

## 🎭 Animation Colors

### Pulse (Green)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
/* Used for "Connected" indicators */
```

### Glow Pulse (Cyan)
```css
@keyframes glowPulse {
  0%, 100% { 
    box-shadow: 0 0 5px rgba(0,217,255,0.3); 
  }
  50% { 
    box-shadow: 0 0 20px rgba(0,217,255,0.8); 
  }
}
/* Used for active elements */
```

### Blink (Red)
```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
/* Used for error states */
```

---

## 📚 References

- **Primary Inspiration**: NASA Mission Control, SpaceX Starship UI
- **Color Psychology**: 
  - Cyan = Technology, clarity, future
  - Green = Success, health, operational
  - Amber = Caution, attention needed
  - Red = Danger, critical, immediate action

---

**SolarGuard 3D Color Palette - Designed for NASA-Level Mission Control**
