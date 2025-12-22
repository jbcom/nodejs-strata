/**
 * Complete Spatial Audio System for Strata.
 *
 * Provides React Three Fiber components for immersive spatial audio including
 * positional emitters, environmental reverb, background ambience, and footstep systems.
 *
 * @packageDocumentation
 * @module components/audio
 * @category Player Experience
 *
 * ## Interactive Demos
 * - 🎮 [Live Audio Demo](http://jonbogaty.com/nodejs-strata/demos/audio.html)
 * - 📦 [3D Soundscape Example](https://github.com/jbcom/nodejs-strata/tree/main/examples/audio-system)
 *
 * @example
 * ```tsx
 * <AudioProvider>
 *   <AmbientAudio url="/music/forest_bg.mp3" volume={0.5} />
 *   <PositionalAudio url="/sounds/waterfall.wav" position={[10, 0, 0]} />
 * </AudioProvider>
 * ```
 */

export { AmbientAudio } from './AmbientAudio';
export { AudioEmitter } from './AudioEmitter';
export { AudioEnvironment } from './AudioEnvironment';
export { AudioListener } from './AudioListener';
export { AudioZone } from './AudioZone';
export {
    AudioProvider,
    useAudioContext,
    useAudioListener,
    useAudioManager,
    useSpatialAudio,
} from './context';
export { FootstepAudio } from './FootstepAudio';
export { PositionalAudio } from './PositionalAudio';
export type {
    AmbientAudioProps,
    AmbientAudioRef,
    AudioContextValue,
    AudioEmitterProps,
    AudioEmitterRef,
    AudioEnvironmentProps,
    AudioListenerProps,
    AudioProviderProps,
    AudioZoneProps,
    AudioZoneRef,
    FootstepAudioProps,
    FootstepAudioRef,
    PositionalAudioProps,
    PositionalAudioRef,
    WeatherAudioProps,
} from './types';
export { WeatherAudio } from './WeatherAudio';
