# Active Context

## strata

Procedural 3D graphics library for React Three Fiber.

### Features

- Terrain generation (SDF, marching cubes)
- Water effects (waves, caustics)
- Sky system (day/night cycle, weather)
- Volumetric effects (fog, underwater)
- Vegetation instancing (with seeded random for reproducibility)
- Particle systems
- Character animation
- Post-processing effects

### Package Status

- **Registry**: npm (@jbcom/strata)
- **Repository**: github.com/jbcom/nodejs-strata
- **Framework**: React Three Fiber
- **Dependencies**: three, @react-three/fiber, @react-three/drei

### Development

```bash
pnpm install
pnpm run build
pnpm run test
pnpm run demo          # Serve demo files
pnpm run format        # Biome format
pnpm run format:check  # Biome format check
```

### Architecture

- `src/core/` - Pure TypeScript algorithms (no React)
- `src/components/` - React Three Fiber components
- `src/shaders/` - GLSL shaders
- `src/presets/` - Ready-to-use configurations
- `examples/` - Working example projects

### Recent Changes (2025-12-18)

- **Migration completed**: All references updated from jbdevprimary/strata to jbcom/nodejs-strata
- **17 PRs merged**: Dependency updates and infrastructure sync
- **Documentation system**: Using TypeDoc for API documentation
- **Issues addressed**:
  - #7: Fixed Coveralls coverage configuration (reportsDirectory added)
  - #21: Added `demo` script to serve demo files
  - #22: Created examples directory with basic-terrain example
- **GAPS.md updates**:
  - Seeded random implemented (optional seed parameter)
  - Input validation added to instancing functions
  - GPU wind/LOD props documented with JSDoc
- **CI/CD improvements**:
  - All GitHub Actions pinned to exact SHAs for security
  - Documentation workflow fixed to use TypeDoc instead of Sphinx

### PR Cleanup Session (2025-12-20)

**Session**: cursor/project-cleanup-and-assessment-4c4f

**PRs Merged (7 total)**:

- #35: deps: @types/node 25.0.2 → 25.0.3
- #36: deps: @ai-sdk/mcp beta.39 → beta.40
- #37: deps: ai-sdk-ollama 2.0.1 → 2.1.0
- #39: deps: @biomejs/biome 2.3.9 → 2.3.10
- #40: ⚡ Optimize noise function allocations (APPROVED by Claude)
- #41: 🛡️ Fix missing state integrity check (security fix)
- #44: ⚡ Optimize marching cubes vector allocations

**Remaining Open PRs (4)**:

- #38: deps: ai 5.0.113 → 5.0.115 (merge conflicts with pnpm-lock.yaml)
- #42: 🎨 UI Accessibility (build fails, superseded by #45)
- #43: 🛡️ State integrity check (duplicate of merged #41)
- #45: 🎨 DialogBox accessibility (flaky test in CI, needs merge)

**Actions Taken**:

- Marked draft PRs #40, #41, #43, #44 as ready for review
- Created `PR_MERGE_STRATEGY.md` with complete assessment
- Fixed flaky timing test in `stateMachine.test.ts`
- All 1,033 tests passing
- Code coverage at 73.41%

**AI Feedback Assessment**:

- PR #40: Positive - excellent performance optimization
- PR #41: Positive - important security fix
- PR #42: CHANGES_REQUESTED - valid issues identified
- All AI feedback was substantive, no hallucinations detected

---

### Strata 2.0 Planning Session (2025-12-23)

**Session**: cursor/strata-2-0-project-restructuring-9c1a

**Comprehensive Assessment Completed**:

1. **Main Repository Analysis**:
   - Current version: 1.4.10
   - 1,033 tests at 73.41% coverage
   - Extensive RFCs for Game Framework (Epic #50)
   - v2.0 Export Reorganization planned (Epic #84)

2. **Sub-Package Ecosystem Discovered**:
   - nodejs-strata-shaders (new, pending extraction)
   - nodejs-strata-presets (new, pending extraction)
   - nodejs-strata-examples (needs migration)
   - nodejs-strata-typescript-tutor (Professor Pixel platform)
   - nodejs-strata-react-native-plugin (new)
   - nodejs-strata-capacitor-plugin (new)

3. **Domain Structure Planned**:
   - Apex: strata.game → Main documentation
   - tutor.strata.game → Professor Pixel
   - examples.strata.game → Interactive demos
   - shaders.strata.game → Shader docs
   - presets.strata.game → Preset gallery
   - react-native.strata.game → RN plugin docs
   - capacitor.strata.game → Capacitor docs

4. **Brand Identity Created**:
   - Strata-specific color palette (terrain, water, vegetation, sky)
   - Layer-based visual metaphor
   - Within jbcom guidelines with unique character
   - CSS assets created in docs/_static/strata-brand.css

5. **Key Documents Created**:
   - STRATA_2_0_PLAN.md - Comprehensive restructuring plan
   - docs/STRATA_BRAND_GUIDE.md - Brand identity guidelines
   - docs/_static/strata-brand.css - Brand CSS assets

6. **Critical v2.0 Issues Identified**:
   - #85: Remove type re-exports from presets
   - #86: Rename conflicting core exports
   - #87: Create migration guide
   - #88: Clean up internal/triage
   - #89: Extract presets/shaders to packages

7. **Game Framework (Epic #50) Status**:
   - RFC-001: Game Orchestration (Proposed)
   - RFC-002: Compositional Objects (Proposed)
   - RFC-003: World Topology (Proposed)
   - RFC-004: Declarative Games (Proposed)

8. **Milestones Defined** (issue-scoped, dependency-ordered):
   - M1: Export Cleanup (#85, #86, #87) - starting point
   - M2: Package Extraction (#88, #89) - blocked by M1
   - M3: Infrastructure (domain/DNS) - parallel with M1
   - M4: Documentation Site - blocked by M2, M3
   - M5: Game Orchestration (RFC-001) - blocked by M1
   - M6: Compositional Objects (RFC-002) - blocked by M1
   - M7: World Topology (RFC-003) - blocked by M5, M6
   - M8: Declarative API (RFC-004) - blocked by M7
   - M9: Validation (Rivermarsh port) - blocked by M8

9. **Validation Targets**:
   - nodejs-rivermarsh (Primary)
   - nodejs-otter-river-rush (Racing mode)
   - nodejs-otterfall (AI/terrain)

**Immediate Actions**:
- Maintainer: Review STRATA_2_0_PLAN.md, configure strata.game domain (M3)
- AI Agents: Begin M1 - Issue #85 (remove type re-exports)
- Parallel: Draft M4 landing page content

---

### Strata Game Studio Vision (2025-12-23)

**Session**: cursor/strata-2-0-project-restructuring-9c1a (continued)

**Major Discovery - Four Game Development Paradigms**:

Identified fragmented game development tooling across organization:

| Repo | Language | Focus |
|------|----------|-------|
| nodejs-strata | TypeScript | 3D rendering engine |
| nodejs-strata-typescript-tutor | TypeScript | Professor Pixel education + wizards |
| python-agentic-game-development | Python | AI-powered game academy |
| rust-agentic-game-development | Rust | Core AI libraries |
| rust-agentic-game-generator | Rust | RPG generation |

**Unified Vision Created**: Strata Game Studio

```
STRATA GAME STUDIO
├── Strata Engine (strata.game)        - Core framework
├── Strata Workshop (workshop.strata.game) - AI game wizards
├── Strata Learn (learn.strata.game)   - Education platform
├── Strata Arcade (arcade.strata.game) - Game showcase
└── Strata AI                          - Cross-cutting AI layer
```

**Agentic Architecture Clarified**:
- agentic-triage = Primitives layer
- agentic-control = Orchestration (builds on triage)
- Workshop flows → agentic-control configurations
- internal/triage stays (is @strata/triage, not same as agentic-triage)

**Professor Pixel Evolution**:
From "tutor mascot" → Strata's official brand mascot across ALL properties

**Key Documents Created**:
- docs/architecture/STRATA_GAME_STUDIO_VISION.md
- Updated STRATA_2_0_PLAN.md with Part 10: Game Studio Vision

**New Issues Created**:
- #100: Migrate internal/triage to nodejs-agentic-triage
- #101: EPIC: Strata Game Studio (added to Roadmap project)
- typescript-tutor#25: Convert lessons to TypeScript/Strata curriculum
- typescript-tutor#26: Full Strata sub-package alignment

**Cloned & Reviewed**:
- nodejs-strata-typescript-tutor → /tmp/
- PR #24 analysis: Package renamed but lessons still Python (incomplete!)
- Wizard flows discovered: platformer, racing, rpg, dungeon, space, puzzle, adventure

**Validation Games Identified**:
- nodejs-rivermarsh (mobile exploration)
- nodejs-otter-river-rush (racing)
- nodejs-otterfall (3D adventure)
- nodejs-rivers-of-reckoning (roguelike)

**Decisions Made**:
1. npm scope: **@strata** ✅
2. Repository management: control-center ecosystem sync + settings.yml ✅
3. typescript-tutor: **Stays as-is** (correct repo, correct name) ✅
4. Professor Pixel scope: **Education + Workshop ONLY** ✅
   - Kindly Professor → Learn/Education
   - Cyberpunk version → Workshop/Game creation
   - NOT a general Strata mascot
5. Hosting: **GitHub Pages** for all properties ✅

**Open Decisions for Maintainer**:
1. AI Core distribution (WASM + napi-rs + PyO3?)
2. Community features (user accounts, game jams) - Future

---

### Control Center Integration (2025-12-23)

**Issues Created in jbcom/control-center**:

| Issue | Title |
|-------|-------|
| [#416](https://github.com/jbcom/control-center/issues/416) | 🌐 Domain: Configure agentic.dev for @agentic ecosystem |
| [#417](https://github.com/jbcom/control-center/issues/417) | 🌐 Domain: Configure strata.game for @strata ecosystem |
| [#418](https://github.com/jbcom/control-center/issues/418) | 📚 docs: Document multi-repo domain standard |

**Multi-Repo Domain Standard Defined**:

Projects qualifying for dedicated domain:
- ≥ 3 active repositories
- Cross-repository dependencies
- ≥ 2 published packages
- Unified documentation need

**Qualified Ecosystems**:

| Ecosystem | Domain | npm Scope |
|-----------|--------|-----------|
| Strata | strata.game | @strata |
| Agentic | agentic.dev | @agentic |

**npm Package Mapping**:

| Current | Target |
|---------|--------|
| @jbcom/strata | @strata/core |
| @jbcom/strata-shaders | @strata/shaders |
| @jbcom/strata-presets | @strata/presets |
| (new) | @strata/studio |

---

Last updated: 2025-12-23
