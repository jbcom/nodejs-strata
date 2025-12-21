# RFC-001: Game Orchestration Architecture

> **Status**: Proposed
> **Issue**: [#51](https://github.com/jbcom/nodejs-strata/issues/51)
> **Epic**: [#50](https://github.com/jbcom/nodejs-strata/issues/50)

## Summary

This RFC proposes the core orchestration layer for Strata, enabling games to define and manage scenes, modes, triggers, and transitions.

## Motivation

Strata provides excellent rendering primitives but no way to orchestrate them into a game. Every game needs:

1. **Scene management** - Title screen, gameplay, pause menu
2. **Mode management** - Exploration, combat, dialogue, inventory
3. **Spatial triggers** - Proximity events, collision handlers
4. **Transitions** - Fade, crossfade, wipe between scenes/modes

Currently, developers must implement these from scratch.

## Detailed Design

### SceneManager

Scenes are top-level game states with complete render trees.

```typescript
interface Scene {
  id: string;
  setup: () => Promise<void>;      // Called before scene loads
  teardown: () => Promise<void>;   // Called after scene unloads
  render: () => JSX.Element;       // Scene's 3D content
  ui?: () => JSX.Element;          // Scene's 2D overlay
}

interface SceneManagerConfig {
  initialScene: string;
  loadingComponent?: React.ComponentType<{ progress: number }>;
}

interface SceneManager {
  // Registration
  register(scene: Scene): void;
  
  // Navigation
  load(sceneId: string): Promise<void>;       // Replace current scene
  push(sceneId: string): Promise<void>;       // Stack scene (overlay)
  pop(): Promise<void>;                        // Remove top scene
  
  // State
  current: Scene;
  stack: Scene[];
  isLoading: boolean;
  loadProgress: number;
}

// Factory
function createSceneManager(config: SceneManagerConfig): SceneManager;
```

**Usage Example**:
```typescript
const scenes = createSceneManager({ initialScene: 'title' });

scenes.register({
  id: 'title',
  setup: async () => { /* Load title assets */ },
  teardown: async () => { /* Cleanup */ },
  render: () => <TitleScreen />,
  ui: () => <TitleUI />,
});

scenes.register({
  id: 'gameplay',
  setup: async () => { /* Load game world */ },
  teardown: async () => { /* Save progress */ },
  render: () => <GameWorld />,
  ui: () => <GameHUD />,
});

// In UI
<button onClick={() => scenes.load('gameplay')}>Start Game</button>
```

### ModeManager

Modes are gameplay states within a scene. Unlike scenes, modes share the same 3D world.

```typescript
type GameMode = string;  // 'exploration' | 'combat' | 'racing' | etc.

interface ModeConfig {
  id: GameMode;
  
  // Active systems in this mode
  systems: SystemFn[];
  
  // Mode-specific input mapping
  inputMap: InputMapping;
  
  // Mode-specific UI overlay
  ui?: React.ComponentType<{ mode: ModeConfig }>;
  
  // Lifecycle hooks
  onEnter?: (props?: object) => void;
  onExit?: () => void;
  onPause?: () => void;   // When another mode is pushed on top
  onResume?: () => void;  // When returning from a pushed mode
}

interface ModeManager {
  // Registration
  register(mode: ModeConfig): void;
  
  // Stack operations
  push(modeId: GameMode, props?: object): void;
  pop(): void;
  replace(modeId: GameMode, props?: object): void;
  
  // State
  current: ModeConfig;
  stack: ModeConfig[];
  
  // Check mode
  isActive(modeId: GameMode): boolean;
  hasMode(modeId: GameMode): boolean;
}

// Factory
function createModeManager(defaultMode: GameMode): ModeManager;
```

**Usage Example**:
```typescript
const modes = createModeManager('exploration');

modes.register({
  id: 'exploration',
  systems: [movementSystem, cameraSystem, interactionSystem],
  inputMap: explorationInputs,
  ui: ExplorationHUD,
});

modes.register({
  id: 'racing',
  systems: [racingMovementSystem, obstacleSystem, scoreSystem],
  inputMap: racingInputs,
  ui: RacingHUD,
  onEnter: ({ waterway }) => initRace(waterway),
  onExit: () => cleanupRace(),
});

// Trigger racing mode
modes.push('racing', { waterway: 'marsh_to_forest' });
```

### TriggerSystem

Triggers are spatial event handlers implemented as ECS components.

```typescript
interface TriggerComponent {
  id: string;
  type: 'proximity' | 'collision' | 'interaction' | 'timed';
  
  // Shape (for spatial triggers)
  shape?: 'sphere' | 'box' | 'cylinder';
  radius?: number;              // For sphere/cylinder
  size?: [number, number, number];  // For box
  
  // Activation
  condition?: (entity: Entity) => boolean;  // Additional check
  action: (entity: Entity, trigger: Entity) => void;
  
  // Behavior
  cooldown?: number;   // Seconds before can trigger again
  once?: boolean;      // Only trigger once ever
  enabled?: boolean;   // Can be toggled
  
  // State
  lastTriggered?: number;
  triggerCount?: number;
}

// System
function createTriggerSystem(): SystemFn {
  return (world, delta) => {
    const triggers = world.query('trigger', 'transform');
    const triggerables = world.query('triggerable', 'transform');
    
    for (const trigger of triggers) {
      if (!trigger.trigger.enabled) continue;
      
      for (const target of triggerables) {
        if (isInRange(trigger, target) && meetsCondition(trigger, target)) {
          executeTrigger(trigger, target);
        }
      }
    }
  };
}
```

**Usage Example**:
```typescript
// River crossing trigger
world.add({
  transform: { position: new Vector3(25, 0, 0) },
  trigger: {
    id: 'river_crossing_marsh_forest',
    type: 'proximity',
    shape: 'cylinder',
    radius: 5,
    condition: (player) => {
      const gameState = useGameStore.getState();
      return !gameState.unlockedWaterways.includes('marsh_to_forest');
    },
    action: (player) => {
      modeManager.push('racing', { 
        waterway: 'marsh_to_forest',
        onComplete: () => {
          useGameStore.getState().unlockWaterway('marsh_to_forest');
        }
      });
    },
    once: true,  // Only triggers first time
  },
});
```

### TransitionSystem

Transitions provide visual effects between scenes and modes.

```typescript
type TransitionType = 'fade' | 'crossfade' | 'wipe' | 'iris' | 'dissolve' | 'none';

interface TransitionConfig {
  type: TransitionType;
  duration: number;              // Seconds
  easing?: (t: number) => number;
  
  // Type-specific options
  color?: string;                // For fade
  direction?: 'left' | 'right' | 'up' | 'down';  // For wipe
  center?: [number, number];     // For iris
}

interface TransitionManager {
  // Execute transition
  start(config: TransitionConfig): Promise<void>;
  
  // Control
  cancel(): void;
  
  // State
  isTransitioning: boolean;
  progress: number;
}

function createTransitionManager(): TransitionManager;
```

**Integration with SceneManager**:
```typescript
// Scene load with transition
async function loadWithTransition(sceneId: string) {
  await transitions.start({ type: 'fade', duration: 0.5, color: 'black' });
  await scenes.load(sceneId);
  await transitions.start({ type: 'fade', duration: 0.5, color: 'black' });
}
```

## Integration

### With Existing ECS
```typescript
// Triggers are components
world.add({
  transform: { ... },
  trigger: { ... },
});

// TriggerSystem runs in frame loop
useFrame((_, delta) => {
  triggerSystem(world, delta);
});
```

### With State Management
```typescript
// Modes affect game state
const modeManager = createModeManager('exploration');
useGameStore.setState({ currentMode: modeManager.current.id });

modeManager.on('modeChange', (mode) => {
  useGameStore.setState({ currentMode: mode.id });
});
```

### With Input
```typescript
// Each mode has its own input map
const explorationInputs: InputMapping = {
  'move': { keyboard: ['WASD'], gamepad: 'leftStick' },
  'interact': { keyboard: 'E', gamepad: 'A' },
};

const racingInputs: InputMapping = {
  'steer': { keyboard: ['AD'], gamepad: 'leftStick', tilt: true },
  'boost': { keyboard: 'Space', gamepad: 'B' },
};
```

## Alternatives Considered

### 1. React Router Pattern
Treat scenes as routes with URL-based navigation.

**Rejected**: Doesn't handle mode stacking well; games aren't document-based.

### 2. Bevy-like State Machine
Use a formal state machine for all game states.

**Rejected**: Too rigid for overlapping modes; poor React integration.

### 3. External Framework
Use Phaser or similar for orchestration.

**Rejected**: Would require abandoning R3F paradigm; too heavy.

## Open Questions

1. **Scene vs Mode boundary**: When should something be a scene vs. a mode? Current proposal: Scenes have separate 3D worlds; modes share a world.

2. **Async triggers**: Should trigger actions be async? What happens if a trigger starts a mode transition?

3. **Trigger vs System**: Should triggers be a special component type or a generic system pattern?

## Implementation Plan

1. **Week 1**: SceneManager implementation and tests
2. **Week 1**: ModeManager implementation and tests
3. **Week 2**: TriggerSystem implementation and tests
4. **Week 2**: TransitionSystem implementation and tests
5. **Week 3**: Integration tests and examples

---

*Parent: [RFC Index](../README.md)*
