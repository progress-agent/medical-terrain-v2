# Neurodegenerative Trials Terrain

An immersive 3D visualization of Alzheimer's and Parkinson's disease drug development pipelines.

## Overview

This project integrates two previous works:
- **Medical Progress Dashboard**: Comprehensive clinical trial data for Alzheimer's and Parkinson's research
- **Medical Terrain 3D**: Immersive Three.js visualization concept

The result is a 3D terrain where clinical trials are represented as markers positioned across a mountainous landscape based on their development phase—valley for Phase 1, slopes for Phase 2, summit for Phase 3, and the peak for approved drugs.

## Features

- **3D Terrain Visualization**: Procedurally generated mountain landscape
- **Trial Markers**: Visual encoding of drug type, phase, and status
- **Disease Toggle**: Filter between Alzheimer's, Parkinson's, or view all
- **Interactive Tooltips**: Hover for quick info, click for detailed panel
- **Recent Updates Feed**: Scrollable updates from the research landscape
- **Design System**: Strict adherence to defined color palette and typography

## Design System

- **Background**: `#0a0a0a`
- **Card/Surface**: `#141414`
- **Gold Accent**: `#c9b896`
- **Alzheimer's**: `#60a5fa` (blue)
- **Parkinson's**: `#f472b6` (pink)
- **Biologic**: `#22c55e` (green marker)
- **Small Molecule**: `#a78bfa` (lavender marker)
- **Typography**: IBM Plex Sans & IBM Plex Mono

## Tech Stack

- Three.js (via CDN)
- Vanilla JavaScript (ES modules)
- CSS custom properties
- Netlify for deployment

## Data Sources

Clinical trial data synthesized from:
- ClinicalTrials.gov API patterns
- Published research and press releases
- Company announcements

## Development

```bash
# Clone the repo
git clone https://github.com/progress-agent/medical-terrain-v2.git

# No build step required - pure HTML/JS/CSS
# Serve with any static server
npx serve .
```

## Deployment

Automatically deploys to Netlify on push to main.

## License

MIT
