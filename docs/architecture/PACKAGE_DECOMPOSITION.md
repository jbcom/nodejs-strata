# Strata Package Decomposition Strategy

## Overview

This document outlines the strategy for decomposing `@jbcom/strata` into modular, optional companion packages while maintaining a seamless developer experience.

## Goals

1. **Reduced Bundle Size** - Allow consumers to import only what they need
2. **Independent Versioning** - Presets and shaders can be updated independently
3. **Community Extensibility** - Third-party presets without modifying core
4. **Zero-Config for Beginners** - Main package works out of the box
5. **Transparent Folding** - Optional packages integrate seamlessly when installed

## Package Architecture

### Core Package: `@jbcom/strata`

The main package remains the primary entry point, containing:

```
@jbcom/strata
├── src/core/           # Pure TypeScript utilities (math, SDF, ECS, etc.)
├── src/components/     # React Three Fiber components
├── src/compose/        # Compositional object system
├── src/game/           # Game orchestration layer
├── src/world/          # World topology system
├── src/hooks/          # React hooks
├── src/api/            # High-level API
└── src/utils/          # Utilities
```

**Exports:**
- `@jbcom/strata` - Main entry (core + game + world + compose)
- `@jbcom/strata/components` - React components
- `@jbcom/strata/api` - High-level API
- `@jbcom/strata/game` - Game orchestration

### Optional Package: `@jbcom/strata-shaders`

**Repository:** `jbcom/strata-shaders`

Pure GLSL shader strings with zero dependencies on strata core.

```
@jbcom/strata-shaders
├── src/
│   ├── clouds.ts       # Cloud shaders
│   ├── fur.ts          # Fur/shell shaders
│   ├── godRays.ts      # God rays shaders
│   ├── sky.ts          # Procedural sky shaders
│   ├── terrain.ts      # Terrain shaders
│   ├── volumetrics.ts  # Volumetric effect shaders
│   ├── water.ts        # Water shaders
│   └── materials/      # Material shaders (toon, hologram, etc.)
└── package.json
```

**Usage:**

```typescript
// Standalone (without strata)
import { waterFragmentShader, waterVertexShader } from '@jbcom/strata-shaders';

// With strata (auto-detected)
import { waterFragmentShader } from '@jbcom/strata/shaders';
```

### Optional Package: `@jbcom/strata-presets`

**Repository:** `jbcom/strata-presets`

Pre-configured settings that depend on `@jbcom/strata` from npm.

```
@jbcom/strata-presets
├── src/
│   ├── ai/             # AI behavior presets (guard, flock, predator, prey)
│   ├── animation/      # Animation presets
│   ├── audio/          # Audio presets
│   ├── camera/         # Camera presets
│   ├── characters/     # Character presets
│   ├── clouds/         # Cloud presets
│   ├── fur/            # Fur presets
│   ├── lighting/       # Lighting presets
│   ├── particles/      # Particle effect presets
│   ├── physics/        # Physics presets
│   ├── postprocessing/ # Post-processing presets
│   ├── terrain/        # Terrain presets
│   ├── vegetation/     # Vegetation presets
│   ├── water/          # Water presets
│   └── weather/        # Weather presets
└── package.json
```

**Dependencies:**

```json
{
  "peerDependencies": {
    "@jbcom/strata": "^2.0.0"
  }
}
```

## Transparent Folding Mechanism

The core package will detect and re-export optional packages when installed:

### Implementation

```typescript
// src/optional/loader.ts

/**
 * Dynamically loads optional packages if available
 */
export function loadOptionalPackage<T>(packageName: string): T | null {
  try {
    return require(packageName);
  } catch {
    return null;
  }
}

// src/shaders/index.ts
export * from './clouds';
export * from './water';
// ... local shaders

// Also re-export from optional package if installed
const optionalShaders = loadOptionalPackage('@jbcom/strata-shaders');
if (optionalShaders) {
  Object.assign(module.exports, optionalShaders);
}
```

### For Presets

```typescript
// src/presets/index.ts
export * from './ai';
export * from './animation';
// ... local presets

// Also re-export from optional package if installed
const optionalPresets = loadOptionalPackage('@jbcom/strata-presets');
if (optionalPresets) {
  Object.assign(module.exports, optionalPresets);
}
```

## Migration Path

### Phase 1: Prepare Core (Current)

1. ✅ Remove type re-exports from presets modules (Issue #85)
2. ✅ Add deprecation notices for direct preset type imports
3. [ ] Add `inlineSources: true` to tsconfig.json ✅
4. [ ] Create package.json exports map

### Phase 2: Create Companion Repositories

1. [ ] Create `strata-shaders` repository
   - Copy `src/shaders/` contents
   - Create independent package.json with zero dependencies
   - Set up CI/CD for independent releases

2. [ ] Create `strata-presets` repository
   - Copy `src/presets/` contents
   - Create package.json with `@jbcom/strata` peer dependency
   - Set up CI/CD for independent releases

### Phase 3: Implement Transparent Folding

1. [ ] Add optional package detection to core
2. [ ] Ensure imports work identically with/without optional packages
3. [ ] Add documentation for both usage patterns

### Phase 4: Deprecation & Removal (v2.0)

1. [ ] Deprecate direct shader/preset imports from core in v1.5
2. [ ] Remove bundled shaders/presets from core in v2.0
3. [ ] Update all documentation

## Bundle Size Analysis

| Configuration | Estimated Size |
|--------------|----------------|
| `@jbcom/strata` (current) | ~350KB |
| `@jbcom/strata` (core only) | ~200KB |
| `@jbcom/strata-shaders` | ~80KB |
| `@jbcom/strata-presets` | ~100KB |

## Import Patterns

### Before (v1.x)

```typescript
// Everything from main package
import { 
  Terrain, Water, createFireEffect, 
  waterFragmentShader, vegetationPresets 
} from '@jbcom/strata';
```

### After (v2.0)

```typescript
// Core functionality
import { Terrain, Water } from '@jbcom/strata';

// Shaders (optional package)
import { waterFragmentShader } from '@jbcom/strata-shaders';

// Presets (optional package)
import { createFireEffect, vegetationPresets } from '@jbcom/strata-presets';

// OR if optional packages are installed, still works from main:
import { waterFragmentShader, createFireEffect } from '@jbcom/strata';
```

## TypeScript Configuration

Each package needs proper TypeScript configuration for source maps and declarations:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "inlineSources": true,
    "outDir": "./dist",
    "strict": true
  }
}
```

## Related Issues

- [#85](https://github.com/jbcom/nodejs-strata/issues/85) - Remove type re-exports from presets
- [#86](https://github.com/jbcom/nodejs-strata/issues/86) - Rename conflicting core exports
- [#87](https://github.com/jbcom/nodejs-strata/issues/87) - Create Strata 2.0 Migration Guide
- [#89](https://github.com/jbcom/nodejs-strata/issues/89) - Extract presets and shaders to standalone packages

## Success Criteria

- [ ] Optional packages can be installed independently
- [ ] Core package works without optional packages
- [ ] TypeScript types work correctly in all configurations
- [ ] Bundle size reduced by 40%+ for minimal installations
- [ ] No breaking changes for existing v1.x users
- [ ] Documentation covers all usage patterns
