/**
 * @module Systems
 * @category Game Systems
 *
 * Game Systems - State Management, Save/Load, and ECS
 *
 * The infrastructure that powers your game - state management with
 * undo/redo, save/load, checkpoints, and entity component systems.
 *
 * @example
 * ```tsx
 * import { GameStateProvider, useGameState, useSaveLoad } from '@jbcom/strata/api/systems';
 *
 * function Game() {
 *   const { saveGame, loadGame } = useSaveLoad();
 *   const health = useGameState(state => state.player.health);
 *
 *   return <HealthDisplay health={health} onSave={saveGame} />;
 * }
 * ```
 */

// State Management - React components and hooks
export {
    GameStateProvider,
    GameStateContext,
    useGameStateContext,
    useGameState,
    useSaveLoad,
    useUndo,
    useCheckpoint,
    useAutoSave,
    PersistGate,
    StateDebugger,
} from '../components';

export type {
    GameStateContextValue,
    GameStateProviderProps,
    UseSaveLoadOptions,
    UseSaveLoadReturn,
    UseUndoReturn,
    UseCheckpointReturn,
    UseAutoSaveOptions,
    UseAutoSaveReturn,
    PersistGateProps,
    StateDebuggerProps,
    GameStoreApi,
    GameStore,
    CheckpointData,
    AutoSaveConfig,
    StateChangeEvent,
} from '../components';

// State Management - Core utilities
export {
    createGameStore,
    createPersistenceAdapter,
    calculateChecksum,
    verifyChecksum,
    webPersistenceAdapter,
    createWebPersistenceAdapter,
} from '../core';

// Zustand re-exports - import directly from zustand packages if needed
// These are provided for convenience but can also be imported from 'zustand' directly
export { create } from 'zustand';
export { useStore } from 'zustand';
export { temporal } from 'zundo';
export { immer } from 'zustand/middleware/immer';

export type {
    GameStoreState,
    GameStoreActions,
    StoreConfig,
    SaveData,
    CheckpointOptions,
    PersistenceAdapter,
    StateChangeType,
    StateListener,
} from '../core';
