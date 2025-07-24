# Background Options for Clairient Website

This document lists the available background options for the homepage hero section. All backgrounds are designed to be unintrusive and professional for a geopolitical intelligence company.

## Available Background Classes

### Current Default
- **Class**: `hero-background` 
- **File**: `/public/hero-bg.svg`
- **Style**: Geometric network pattern with subtle data flow animations
- **Description**: Abstract network nodes and connections with animated data points

### Alternative Options

#### 1. Satellite Imagery Style
- **Class**: `hero-background-satellite`
- **File**: `/public/hero-bg-satellite.svg`
- **Style**: Satellite/terrain inspired with strategic points
- **Description**: Topographic shapes with grid overlay and strategic location markers

#### 2. Ultra Minimal
- **Class**: `hero-background-minimal`
- **File**: `/public/hero-bg-minimal.svg`
- **Style**: Clean geometric divisions
- **Description**: Extremely subtle rectangular sections with thin accent lines

#### 3. Topographic Map
- **Class**: `hero-background-topographic`
- **File**: `/public/hero-bg-topographic.svg`
- **Style**: Contour lines and elevation patterns
- **Description**: Topographic map-inspired contour lines with elevation points

#### 4. Data Visualization
- **Class**: `hero-background-data-viz`
- **File**: `/public/hero-bg-data-viz.svg`
- **Style**: Chart and graph elements
- **Description**: Subtle line graphs, data points, and chart-like grid patterns

#### 5. Global Perspective
- **Class**: `hero-background-globe`
- **File**: `/public/hero-bg-globe.svg`
- **Style**: Globe with latitude/longitude grid
- **Description**: Spherical grid system with continental outlines and connection arcs

### Animated Options

#### 6. Animated Logo Integration
- **Class**: `hero-background-animated-logo`
- **File**: `/public/hero-bg-animated-logo.svg`
- **Style**: Subtle logo animations with floating elements
- **Description**: Large watermark "C" logo with pulsing animations, floating logo elements, and flowing data particles

#### 7. Floating Elements
- **Class**: `hero-background-floating`
- **File**: `/public/hero-bg-floating-elements.svg`
- **Style**: Floating geometric shapes with smooth animations
- **Description**: Circles and ellipses floating with gentle movements, subtle logo integration, and ambient lighting effects

#### 8. Particle Flow
- **Class**: `hero-background-particles`
- **File**: `/public/hero-bg-particle-flow.svg`
- **Style**: Animated particle systems with flow fields
- **Description**: Moving particles along curved paths, flow field gradients, and subtle grid overlay with breathing ambience

## How to Switch Backgrounds

To change the homepage background, edit `/app/page.tsx` and update the className in the hero section:

```typescript
// Current (line 10):
<section className="min-h-screen flex items-center justify-center hero-background">

// To change to satellite style:
<section className="min-h-screen flex items-center justify-center hero-background-satellite">

// To change to minimal style:
<section className="min-h-screen flex items-center justify-center hero-background-minimal">

// Animated options:
<section className="min-h-screen flex items-center justify-center hero-background-animated-logo">
<section className="min-h-screen flex items-center justify-center hero-background-floating">
<section className="min-h-screen flex items-center justify-center hero-background-particles">

// etc.
```

## Design Philosophy

All backgrounds follow these principles:
- **Subtle opacity**: All elements use very low opacity (0.01-0.05) to avoid interference with text
- **Professional colors**: Only using Clairient blue (#1e40af) and light blue (#3b82f6)
- **Scalable**: All are SVG-based for crisp rendering at any size
- **Relevant themes**: Each relates to intelligence, data analysis, or global perspective
- **Minimal distraction**: Designed to enhance, not compete with, the main content

The original network pattern background is preserved as the default option.