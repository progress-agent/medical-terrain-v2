# Deployment Instructions

## Option 1: Netlify Git Integration (Recommended)

The repo is already on GitHub at:
https://github.com/progress-agent/medical-terrain-v2

1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Select GitHub → Authorize → Choose `progress-agent/medical-terrain-v2`
4. Build settings:
   - Build command: (leave empty - no build needed)
   - Publish directory: `/` (root)
5. Click "Deploy site"

Netlify will auto-deploy on every push to main.

## Option 2: Netlify CLI (if you have auth set up)

```bash
cd /home/openclaw/.openclaw/workspace/projects/medical-terrain-v2
netlify deploy --prod --dir=.
```

## Option 3: Manual Drag & Drop

1. Zip the project folder (make sure index.html is at root)
2. Go to https://app.netlify.com/drop
3. Drag the zip file

## Files Structure

```
medical-terrain-v2/
├── index.html          # Main HTML with CSS
├── netlify.toml        # Netlify config
├── README.md           # Documentation
└── src/
    ├── app.js          # Three.js application
    └── data/
        └── clinicalData.js  # Trial data
```

## What Was Built

**Integration of two previous works:**

1. **Medical Progress Dashboard** (last night's work)
   - Comprehensive Alzheimer's/Parkinson's clinical trial data
   - 30+ trials across all phases
   - Recent updates feed

2. **Medical Terrain 3D** (this morning's design work)
   - Three.js 3D landscape visualization
   - Terrain metaphor: valley→slopes→summit→peak = Phase 1→2→3→Approved

**Integrated result:**
- 3D terrain with 20 trial markers positioned by phase
- Visual encoding: size=enrollment, color=disease+type, style=purpose
- Interactive: hover tooltips, click for detail panel
- Disease filter toggle (All/Alzheimer's/Parkinson's)
- Design system compliance (IBM Plex fonts, #0a0a0a bg, #c9b896 gold accent)

## GitHub Repo

https://github.com/progress-agent/medical-terrain-v2
