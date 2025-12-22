/**
 * Global Game State Management for Strata.
 *
 * Provides a unified system for managing game state, including persistence,
 * undo/redo history, automatic saving, and state debugging tools.
 *
 * @packageDocumentation
 * @module components/State
 * @category Game Systems
 *
 * ## API Documentation
 * - [Full API Reference](http://jonbogaty.com/nodejs-strata/api)
 *
 * @example
 * ```tsx
 * <GameStateProvider
 *   initialState={createRPGState({ player })}
 *   persistence="localstorage"
 * >
 *   <App />
 * </GameStateProvider>
 * ```
 */

export {
    GameStateContext,
    GameStateProvider,
    PersistGate,
    StateDebugger,
    useGameState,
    useGameStateContext,
    useUndo,
} from './state/context';

export { useAutoSave, useCheckpoint, useSaveLoad } from './state/hooks';

export type {
    AutoSaveConfig,
    CheckpointData,
    GameStateContextValue,
    GameStateProviderProps,
    GameStore,
    GameStoreApi,
    PersistGateProps,
    StateChangeEvent,
    StateDebuggerProps,
    UseAutoSaveOptions,
    UseAutoSaveReturn,
    UseCheckpointReturn,
    UseSaveLoadOptions,
    UseSaveLoadReturn,
    UseUndoReturn,
} from './state/types';
