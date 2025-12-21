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
        const soundResourceId = useMemo(
            () => `ambient-${url}-${Math.random().toString(36).substr(2, 9)}`,
            [url]
        );

        useEffect(() => {
            if (!soundManager) return;

            let isMounted = true;
            let aborted = false;

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

                    // Prevent setup if component unmounted or effect invalidated
                    if (!isMounted || aborted) {
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
                aborted = true;
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
                        // Avoid overlapping tracks for the same ambient resource
                        if (!soundManager.isPlaying(soundResourceId)) {
                            soundIdRef.current = soundManager.play(soundResourceId);
                        }
                    }
                },
                stop: () => {
                    if (soundManager) {
                        soundManager.stop(soundResourceId, soundIdRef.current);
                    }
                },
                fadeIn: (duration: number) => {
                    if (soundManager) {
                        if (!soundManager.isPlaying(soundResourceId)) {
                            soundIdRef.current = soundManager.play(soundResourceId);
                        }

                        const newId = soundIdRef.current;
                        if (newId !== undefined) {
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
                    return soundManager ? soundManager.isPlaying(soundResourceId) : false;
                },
            }),
            [soundManager, soundResourceId]
        );

        return null;
    }
);

AmbientAudio.displayName = 'AmbientAudio';
