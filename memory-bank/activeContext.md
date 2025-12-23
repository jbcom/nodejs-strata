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
   - Phase 1 (Architecture) complete
   - Phase 2-6 planned (8 weeks total)

8. **Validation Targets**:
   - nodejs-rivermarsh (Primary)
   - nodejs-otter-river-rush (Racing mode)
   - nodejs-otterfall (AI/terrain)

**Next Steps**:
- Maintainer review of STRATA_2_0_PLAN.md
- Domain registration (strata.game)
- Begin Phase 1 implementation (export cleanup)
- Create GitHub issues from plan

---

Last updated: 2025-12-23
