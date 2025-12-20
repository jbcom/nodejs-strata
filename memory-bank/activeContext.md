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

Last updated: 2025-12-20
