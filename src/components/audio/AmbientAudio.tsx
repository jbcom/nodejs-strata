/**
 * AmbientAudio Component
 *
 * Non-positional ambient audio using Howler.js via SoundManager.
 * @module components/audio
 */

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useAudioManager } from './context';
import type { AmbientAudioProps, AmbientAudioRef } from './types';

/**
 * Non-positional ambient audio for background music and atmosphere.
 *
 * @example
 * ```tsx
 * <AmbientAudio
 *   url="/music/ambient.mp3"
 *   volume={0.5}
 *   loop={true}
 *   autoplay={true}
 *   fadeTime={2}
 * />
 * ```
 */
export const AmbientAudio = forwardRef<AmbientAudioRef, AmbientAudioProps>(
    ({ url, volume = 1, loop = true, autoplay = false, fadeTime = 0, onLoad }, ref) => {
        const soundManager = useAudioManager();
        const soundIdRef = useRef<number | undefined>(undefined);
        const targetVolumeRef = useRef(volume);

        // Generate a unique ID for this sound instance to avoid conflicts
        // We use the URL in the ID to make it descriptive, but add a random suffix
        const soundResourceId = useMemo(() => `ambient-${url}-${Math.random().toString(36).substr(2, 9)}`, [url]);

        useEffect(() => {
            if (!soundManager) return;

            let isMounted = true;

            const loadSound = async () => {
                try {
                    await soundManager.load(
                        soundResourceId,
                        {
                            src: url,
                            loop,
                            volume: fadeTime > 0 && autoplay ? 0 : volume,
                            preload: true,
                            autoplay: false, // We handle autoplay manually to support fade
                        },
                        'ambient'
                    );

                    if (!isMounted) {
                        soundManager.unload(soundResourceId);
                        return;
                    }

                    onLoad?.();

                    if (autoplay) {
                        soundIdRef.current = soundManager.play(soundResourceId);
                        if (fadeTime > 0 && soundIdRef.current !== undefined) {
                            soundManager.fade(
                                soundResourceId,
                                0,
                                volume,
                                fadeTime * 1000,
                                soundIdRef.current
                            );
                        }
                    }
                } catch (error) {
                    if (isMounted) {
                        console.error(`Failed to load ambient audio: ${error}`);
                    }
                }
            };

            loadSound();

            return () => {
                isMounted = false;
                soundManager.unload(soundResourceId);
                soundIdRef.current = undefined;
            };
        }, [soundManager, soundResourceId, url, loop, autoplay, fadeTime, onLoad, volume]);

        useEffect(() => {
            targetVolumeRef.current = volume;
            if (soundManager && soundIdRef.current !== undefined) {
                soundManager.setVolume(soundResourceId, volume, soundIdRef.current);
            }
        }, [soundManager, soundResourceId, volume]);

        useImperativeHandle(
            ref,
            () => ({
                play: () => {
                    if (soundManager) {
                        // Check if already playing? SoundManager.play creates a new instance (or restarts?)
                        // SoundManager.play returns a new ID usually if sprite, but here simple play.
                        // Howl.play() returns a new ID if called multiple times? Yes.
                        // So we should update soundIdRef.
                        soundIdRef.current = soundManager.play(soundResourceId);
                    }
                },
                stop: () => {
                    if (soundManager) {
                        soundManager.stop(soundResourceId, soundIdRef.current);
                    }
                },
                fadeIn: (duration: number) => {
                    if (soundManager) {
                        const id = soundIdRef.current;
                        // Determine if we need to start playing first
                        if (!soundManager.isPlaying(soundResourceId)) { // Note: isPlaying takes resource ID, checks ANY instance?
                             // Howler's playing(id) checks specific instance.
                             // SoundManager.isPlaying(id) -> this.sounds.get(id)?.playing() -> checks if ANY instance is playing.
                             // We probably want to restart if not playing.

                             // If we want to fade in a NEW play
                             if (id !== undefined) {
                                 soundManager.setVolume(soundResourceId, 0, id);
                             }
                             soundIdRef.current = soundManager.play(soundResourceId);
                        }

                        const newId = soundIdRef.current;
                        if (newId !== undefined) {
                            // Ensure volume starts at 0 for the fade
                            soundManager.setVolume(soundResourceId, 0, newId);
                            soundManager.fade(
                                soundResourceId,
                                0,
                                targetVolumeRef.current,
                                duration * 1000,
                                newId
                            );
                        }
                    }
                },
                fadeOut: (duration: number) => {
                    if (soundManager && soundIdRef.current !== undefined) {
                        // We need to know current volume to fade from?
                        // SoundManager doesn't easily expose current instance volume via getVolume(id) which returns global volume for sound.
                        // But we can just use targetVolumeRef.current or assume it's at volume.
                        // Or we can assume 1 if we don't know?
                        // Let's use targetVolumeRef.current as a best guess for 'from'.

                        // Actually Howl.volume(id) returns volume.
                        // soundManager.getVolume(id) returns howl.volume().
                        // But howl.volume(id) gets specific volume? Howler docs say .volume([vol], [id]).
                        // SoundManager.getVolume only calls .volume().

                        // We'll trust targetVolumeRef for now or just fade from current level if Howler handles 'from' smartly?
                        // No, Howler fade needs explicit from/to.

                        soundManager.fade(
                            soundResourceId,
                            targetVolumeRef.current,
                            0,
                            duration * 1000,
                            soundIdRef.current
                        );
                    }
                },
                setVolume: (vol: number, fadeTime?: number) => {
                    targetVolumeRef.current = vol;
                    if (soundManager) {
                        const id = soundIdRef.current;
                        if (fadeTime && fadeTime > 0 && id !== undefined) {
                            soundManager.fade(
                                soundResourceId,
                                // Use current volume from SoundManager as fade starting point
                                soundManager.getVolume(soundResourceId) ?? 1,
                                vol,
                                fadeTime * 1000,
                                id
                            );
                        } else if (id !== undefined) {
                            soundManager.setVolume(soundResourceId, vol, id);
                        }
                    }
                },
                isPlaying: () => {
                     // SoundManager.isPlaying(id) checks if ANY sound in the group is playing.
                     // Since our ID is unique to this component, this is effectively correct.
                     // But we also track soundIdRef to be sure.
                     return soundManager ? soundManager.isPlaying(soundResourceId) : false;
                },
            }),
            [soundManager, soundResourceId]
        );

        return null;
    }
);

AmbientAudio.displayName = 'AmbientAudio';
