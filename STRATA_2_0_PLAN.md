# Strata 2.0 - Comprehensive Project Restructuring Plan

> **Date**: December 23, 2025
> **Status**: Initial Assessment Complete
> **Author**: AI Agent Assessment

---

## Executive Summary

This document outlines the comprehensive plan for Strata 2.0, transforming the project from a modular procedural 3D graphics library into a **complete game framework ecosystem** with:

1. **Core Package** (`@jbcom/strata`) - Focused, clean, well-documented
2. **Sub-Package Ecosystem** - Modular, independent versioning
3. **Dedicated Domain** (`strata.game`) - Professional documentation site
4. **Distinct Brand Identity** - Within jbcom guidelines but with unique character

---

## Part 1: Current State Assessment

### Main Repository: nodejs-strata

| Metric | Current State |
|--------|---------------|
| **Version** | 1.4.10 |
| **Package Name** | `@jbcom/strata` |
| **Test Coverage** | 73.41% (1,033 tests) |
| **Documentation** | TypeDoc-generated |
| **License** | MIT |

#### Capabilities (Current Toolkit)

| Category | Features |
|----------|----------|
| **Rendering** | Terrain, Water, Sky, Vegetation, Particles, Post-processing |
| **Simulation** | Physics (Rapier), AI (Yuka), Animation, Pathfinding |
| **State** | ECS (Miniplex), Zustand store, Save/Load, Checkpoints |
| **Infrastructure** | React Three Fiber, GLSL Shaders |

#### Planned Framework Layers (Epic #50)

| Layer | RFC | Status | Description |
|-------|-----|--------|-------------|
| Layer 1 | RFC-001 | Proposed | Game Orchestration (Scenes, Modes, Triggers) |
| Layer 2 | RFC-003 | Proposed | World Topology (Regions, Connections) |
| Layer 3 | RFC-002 | Proposed | Compositional Objects (Materials, Skeletons) |
| Layer 4 | RFC-004 | Proposed | Declarative Games (`createGame()`) |

### Outstanding Issues (Key)

| Issue | Title | Priority |
|-------|-------|----------|
| #50 | EPIC: Strata Game Framework | Critical |
| #84 | EPIC: Strata 2.0 Export Reorganization | Critical |
| #85 | Remove type re-exports from presets | High |
| #86 | Rename conflicting core exports | High |
| #87 | Create Strata 2.0 Migration Guide | High |
| #88 | Clean up internal/triage | Medium |
| #89 | Extract presets and shaders to packages | Medium |

---

## Part 2: Sub-Package Ecosystem Assessment

### Existing nodejs-strata-* Repositories

| Repository | Description | Status | Proposed Subdomain |
|------------|-------------|--------|-------------------|
| **nodejs-strata-shaders** | GLSL shader collection | New (needs extraction) | `shaders.strata.game` |
| **nodejs-strata-presets** | Preset configurations | New (needs extraction) | `presets.strata.game` |
| **nodejs-strata-examples** | Example applications | Needs migration | `examples.strata.game` |
| **nodejs-strata-typescript-tutor** | Professor Pixel educational platform | Active | `tutor.strata.game` |
| **nodejs-strata-react-native-plugin** | React Native mobile support | New | `react-native.strata.game` |
| **nodejs-strata-capacitor-plugin** | Capacitor mobile support | New | `capacitor.strata.game` |

### Related Game Projects (Validation Targets)

| Repository | Description | Framework Target |
|------------|-------------|------------------|
| nodejs-rivermarsh | Mobile-first 3D exploration game | Primary validation |
| nodejs-otter-river-rush | Fast-paced river racing game | Racing mode validation |
| nodejs-otterfall | 3D adventure with procedural terrain | AI/terrain validation |

### Sub-Package Issues

| Repo | Issue | Status |
|------|-------|--------|
| strata-shaders | #1: Initial setup extraction | Open |
| strata-presets | #1: Initial setup extraction | Open |
| strata-examples | #2: CI/CD for latest strata | Open |
| strata-examples | #3: Deploy to GitHub Pages | Open |
| strata-examples | #4: Migrate examples from main | Open |
| strata-typescript-tutor | #1: Consolidate as Professor Pixel frontend | Open |

---

## Part 3: Domain Structure - strata.game

### Apex Domain: strata.game

**Purpose**: Primary documentation site with JSDoc/TypeDoc-generated API reference

**Content Structure**:
```
strata.game/
├── / (home)                    → Landing page with showcase
├── /docs                       → Getting started guide
├── /api                        → TypeDoc-generated API reference
├── /examples                   → Interactive demos (embedded)
├── /vision                     → Game framework roadmap
├── /rfc                        → RFC documents
└── /changelog                  → Version history
```

### Subdomain Allocation

| Subdomain | Package | Content |
|-----------|---------|---------|
| `tutor.strata.game` | @jbcom/strata-typescript-tutor | Professor Pixel educational platform |
| `examples.strata.game` | @jbcom/strata-examples | Interactive runnable demos |
| `shaders.strata.game` | @jbcom/strata-shaders | Shader documentation & playground |
| `presets.strata.game` | @jbcom/strata-presets | Preset gallery & configuration |
| `react-native.strata.game` | @jbcom/strata-react-native-plugin | React Native plugin docs |
| `capacitor.strata.game` | @jbcom/strata-capacitor-plugin | Capacitor plugin docs |

### GitHub Pages Configuration

Each repository needs:
```yaml
# .github/workflows/docs.yml
name: Deploy Documentation
on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm run docs:build
      - uses: peaceiris/actions-gh-pages@v4.0.0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
          cname: '[subdomain].strata.game'
```

---

## Part 4: Strata Brand Identity

### Philosophy: "Layer by Layer, World by World"

Strata (meaning "layers") perfectly embodies the framework's architecture:
- **Geological metaphor**: Building worlds layer by layer
- **Framework layers**: From core algorithms to declarative games
- **Visual layers**: Terrain → Water → Vegetation → Sky

### Visual Identity (Within jbcom Guidelines)

#### Color Extensions for Strata

| Purpose | jbcom Base | Strata Extension |
|---------|------------|------------------|
| Primary | `#06b6d4` (Cyan) | `#0891b2` (Darker cyan for "depth") |
| Accent | `#3b82f6` (Blue) | `#22d3ee` (Lighter cyan for "surface") |
| Earth | - | `#78350f` (Brown - terrain) |
| Water | - | `#0284c7` (Deep blue - water) |
| Vegetation | - | `#15803d` (Green - vegetation) |
| Sky | - | `#7c3aed` (Purple - volumetrics) |

#### Typography (jbcom Standard)

| Element | Font | Notes |
|---------|------|-------|
| Headings | Space Grotesk | Bold, modern, technical |
| Body | Inter | Clean, readable |
| Code | JetBrains Mono | Monospace for code |
| **Logo** | Custom "STRATA" | Layered letterforms |

#### Logo Concept

```
  ╔══════════════════════════╗
  ║   S T R A T A            ║
  ║   ─────────────          ║
  ║   ═══════════════        ║
  ║   ━━━━━━━━━━━━━━━━━      ║
  ╚══════════════════════════╝
  
  Layered horizontal lines through
  or below the wordmark, suggesting
  geological strata / framework layers
```

#### Iconography

| Icon | Represents | Usage |
|------|------------|-------|
| 🏔️ | Terrain | Terrain features |
| 🌊 | Water | Water systems |
| 🌲 | Vegetation | Vegetation/instancing |
| ☁️ | Sky | Sky/volumetrics |
| 🎮 | Game | Game framework |
| ⚡ | Core | Core utilities |

### Documentation Theming

```css
/* Strata-specific overrides for TypeDoc */
:root {
  /* jbcom base preserved */
  --color-background: #0a0f1a;
  --color-surface: #111827;
  --color-primary: #06b6d4;
  
  /* Strata extensions */
  --strata-terrain: #78350f;
  --strata-water: #0284c7;
  --strata-vegetation: #15803d;
  --strata-sky: #7c3aed;
  
  /* Semantic mapping */
  --strata-layer-1: var(--strata-terrain);
  --strata-layer-2: var(--strata-water);
  --strata-layer-3: var(--strata-vegetation);
  --strata-layer-4: var(--strata-sky);
}
```

---

## Part 5: Repository Restructuring Plan

### Core Package (nodejs-strata) Focus

**Keep in Main Repository**:
```
src/
├── core/          # Pure TypeScript algorithms (NO React)
├── components/    # → Renamed to react/ in exports
├── hooks/         # React hooks
├── api/           # High-level API
├── game/          # NEW: Game orchestration (RFC-001)
├── world/         # NEW: World topology (RFC-003)
├── compose/       # NEW: Compositional objects (RFC-002)
└── framework/     # NEW: Declarative games (RFC-004)
```

**Move OUT of Main Repository**:

| Content | Target | Reason |
|---------|--------|--------|
| `src/shaders/` | nodejs-strata-shaders | Zero strata dependency, pure GLSL |
| `src/presets/` | nodejs-strata-presets | Independent versioning |
| `examples/` | nodejs-strata-examples | Keep main package lean |
| `internal/triage/` | nodejs-agentic-triage | Already exists separately |

### Export Structure (2.0)

| Path | Content | Dependencies |
|------|---------|--------------|
| `@jbcom/strata` | Core algorithms | three |
| `@jbcom/strata/react` | React components | react, @react-three/fiber |
| `@jbcom/strata/game` | Game orchestration | core + react |
| `@jbcom/strata/world` | World topology | core |
| `@jbcom/strata/compose` | Compositional objects | core + react |
| `@jbcom/strata/ai` | AI components | yuka (optional) |
| `@jbcom/strata/state` | State management | zustand (optional) |
| `@jbcom/strata/physics` | Physics components | @react-three/rapier (optional) |

### package.json Exports (Target)

```json
{
  "name": "@jbcom/strata",
  "version": "2.0.0",
  "exports": {
    ".": {
      "types": "./dist/core/index.d.ts",
      "import": "./dist/core/index.js"
    },
    "./react": {
      "types": "./dist/react/index.d.ts",
      "import": "./dist/react/index.js"
    },
    "./game": {
      "types": "./dist/game/index.d.ts",
      "import": "./dist/game/index.js"
    },
    "./world": {
      "types": "./dist/world/index.d.ts",
      "import": "./dist/world/index.js"
    },
    "./compose": {
      "types": "./dist/compose/index.d.ts",
      "import": "./dist/compose/index.js"
    },
    "./ai": {
      "types": "./dist/ai/index.d.ts",
      "import": "./dist/ai/index.js"
    },
    "./state": {
      "types": "./dist/state/index.d.ts",
      "import": "./dist/state/index.js"
    },
    "./physics": {
      "types": "./dist/physics/index.d.ts",
      "import": "./dist/physics/index.js"
    }
  }
}
```

---

## Part 6: Implementation Timeline

### Phase 0: Preparation (Week 1)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Finalize this plan | AI Agent | ✅ STRATA_2_0_PLAN.md |
| Create GitHub issues for all tasks | TBD | Issue templates |
| Set up domain strata.game | Maintainer | DNS configuration |
| Configure GitHub Pages for apex | TBD | Landing page |

### Phase 1: Export Cleanup (Week 2)

| Task | Issue | Deliverable |
|------|-------|-------------|
| Remove type re-exports from presets | #85 | Clean preset modules |
| Rename conflicting core exports | #86 | `*Core` suffix pattern |
| Update internal imports | - | All tests passing |
| Create migration guide | #87 | MIGRATION.md |

### Phase 2: Content Extraction (Weeks 3-4)

| Task | Issue | Deliverable |
|------|-------|-------------|
| Extract shaders to nodejs-strata-shaders | #89 | @jbcom/strata-shaders |
| Extract presets to nodejs-strata-presets | #89 | @jbcom/strata-presets |
| Migrate examples to nodejs-strata-examples | strata-examples#4 | @jbcom/strata-examples |
| Remove internal/triage | #88 | Clean workspace |

### Phase 3: Documentation Site (Week 5)

| Task | Deliverable |
|------|-------------|
| Build landing page for strata.game | Home page with showcase |
| Configure TypeDoc with Strata branding | API reference |
| Deploy sub-package docs | Subdomains active |
| Create interactive demos | Embedded examples |

### Phase 4: Game Framework Core (Weeks 6-8)

| Task | RFC | Deliverable |
|------|-----|-------------|
| Implement SceneManager | RFC-001 | `@jbcom/strata/game` |
| Implement ModeManager | RFC-001 | Mode switching |
| Implement TriggerSystem | RFC-001 | Spatial triggers |
| Implement TransitionSystem | RFC-001 | Visual transitions |

### Phase 5: Advanced Framework (Weeks 9-12)

| Task | RFC | Deliverable |
|------|-----|-------------|
| Implement WorldGraph | RFC-003 | `@jbcom/strata/world` |
| Implement Material System | RFC-002 | `@jbcom/strata/compose` |
| Implement Skeleton/Creature System | RFC-002 | Creatures |
| Implement createGame() | RFC-004 | Declarative API |

### Phase 6: Validation (Weeks 13-14)

| Task | Target | Metric |
|------|--------|--------|
| Port Rivermarsh to Strata 2.0 | nodejs-rivermarsh | <1000 lines game code |
| Port Otter River Rush | nodejs-otter-river-rush | Racing mode works |
| Performance testing | All | 60fps on mobile |

---

## Part 7: Success Criteria

### Technical Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Code reduction (Rivermarsh) | <1000 lines | ~10000 lines |
| API documentation | 100% | ~60% |
| Test coverage | >80% | 73.41% |
| TypeScript coverage | 100% | ~95% |
| Build size (core only) | <100KB | TBD |

### Ecosystem Health

| Metric | Target |
|--------|--------|
| Sub-packages published | 6 |
| Documentation sites live | 7 |
| GitHub Pages working | All repos |
| Subdomain configuration | All active |

### Community Impact

| Metric | Target |
|--------|--------|
| Time to new game prototype | <1 hour |
| Lines of code per game | 10x reduction |
| Examples available | 10+ |
| Interactive demos | 5+ |

---

## Part 8: Open Questions & Decisions Needed

### Domain Registration

- [ ] Who owns/registers strata.game?
- [ ] DNS provider for subdomain management?
- [ ] SSL certificate strategy (Let's Encrypt via GitHub Pages)?

### Package Publishing

- [ ] npm org scope: Stay with `@jbcom/` or create `@strata/`?
- [ ] Who has npm publish access?
- [ ] Automated release via semantic-release?

### Branding Approval

- [ ] Logo design: Internal or external designer?
- [ ] Color palette extensions: Approved by jbcom brand?
- [ ] Marketing materials needed?

### Professor Pixel Integration

- [ ] Is strata-typescript-tutor the primary Professor Pixel frontend?
- [ ] Integration with python-agentic-game-development?
- [ ] Integration with rust-agentic-game-generator?

---

## Part 9: Next Immediate Actions

### For Maintainer (Jon)

1. **Review this plan** and provide feedback
2. **Register strata.game domain** (if not already registered)
3. **Create DNS entries** for subdomains
4. **Approve color palette extensions** for Strata brand

### For AI Agents

1. **Create GitHub issues** from Phase 1-2 tasks
2. **Begin Issue #85** - Remove type re-exports
3. **Begin Issue #86** - Rename conflicting exports
4. **Draft MIGRATION.md** for users

### For Community

1. **Review RFCs** and provide feedback
2. **Test current 1.x** to identify any missed issues
3. **Propose examples** for the examples package

---

## Appendix A: Complete Repository Map

```
jbcom/
├── nodejs-strata                    # Core framework package
│   ├── src/
│   │   ├── core/                    # Pure TypeScript
│   │   ├── react/                   # React components (renamed from components/)
│   │   ├── game/                    # NEW: Game orchestration
│   │   ├── world/                   # NEW: World topology
│   │   ├── compose/                 # NEW: Compositional objects
│   │   └── framework/               # NEW: Declarative games
│   └── docs/                        # → Deploys to strata.game
│
├── nodejs-strata-shaders            # GLSL shaders package
│   └── docs/                        # → Deploys to shaders.strata.game
│
├── nodejs-strata-presets            # Preset configurations
│   └── docs/                        # → Deploys to presets.strata.game
│
├── nodejs-strata-examples           # Interactive examples
│   └── docs/                        # → Deploys to examples.strata.game
│
├── nodejs-strata-typescript-tutor   # Professor Pixel platform
│   └── docs/                        # → Deploys to tutor.strata.game
│
├── nodejs-strata-react-native-plugin # React Native support
│   └── docs/                        # → Deploys to react-native.strata.game
│
├── nodejs-strata-capacitor-plugin   # Capacitor support
│   └── docs/                        # → Deploys to capacitor.strata.game
│
└── nodejs-rivermarsh                # Primary validation game
    └── Built with @jbcom/strata 2.0
```

---

## Appendix B: Issue Creation Template

For each Phase 1-2 task, create issues with:

```markdown
## Summary
[Brief description of what needs to be done]

## Context
- Part of Strata 2.0 restructuring
- Related to STRATA_2_0_PLAN.md
- Blocks/Blocked by: [issues]

## Acceptance Criteria
- [ ] Specific deliverable 1
- [ ] Specific deliverable 2
- [ ] All tests pass
- [ ] Documentation updated

## Technical Notes
[Implementation hints if any]

## Labels
- `v2.0`
- `breaking-change` (if applicable)
- `architecture`
```

---

*Document Version: 1.0.0*
*Last Updated: December 23, 2025*
