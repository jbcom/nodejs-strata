/**
 * High-performance GPU-based Particle System for Strata.
 *
 * Provides realistic particle effects like fire, smoke, explosions, and magic
 * using GPU-instanced rendering for maximum performance.
 *
 * @packageDocumentation
 * @module components/Particles
 * @category Effects & Atmosphere
 *
 * ## Interactive Demos
 * - 🎮 [Live Particles Demo](http://jonbogaty.com/nodejs-strata/demos/particles.html)
 * - 📦 [Particle Showcase Example](https://github.com/jbcom/nodejs-strata/tree/main/examples/particles-showcase)
 *
 * @example
 * ```tsx
 * // Simple fire effect
 * <ParticleEmitter
 *   position={[0, 0, 0]}
 *   velocity={[0, 2, 0]}
 *   startColor={0xff4400}
 *   endColor={0xff0000}
 *   emissionRate={100}
 * />
 * ```
 */

import { useFrame } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import {
    ParticleEmitter as CoreParticleEmitter,
    type EmissionShape,
    type EmitterShapeParams,
    type ParticleBehavior,
    type ParticleEmitterConfig,
    type ParticleForces,
} from '../core/particles';

export type { EmissionShape, ParticleForces, ParticleBehavior, EmitterShapeParams };

/**
 * Props for the ParticleEmitter component.
 * @category Effects & Atmosphere
 * @interface ParticleEmitterProps
 */
export interface ParticleEmitterProps {
    /** Emitter position in world space. Default: [0, 0, 0]. */
    position?: [number, number, number] | THREE.Vector3;
    /** Random variance applied to particle spawn positions. Default: [0, 0, 0]. */
    positionVariance?: [number, number, number] | THREE.Vector3;
    /** Initial velocity direction and speed for particles. Default: [0, 1, 0]. */
    velocity?: [number, number, number] | THREE.Vector3;
    /** Random variance applied to initial particle velocity. Default: [0.5, 0.5, 0.5]. */
    velocityVariance?: [number, number, number] | THREE.Vector3;
    /** Maximum number of simultaneous particles in the system. Default: 1000. */
    maxParticles?: number;
    /** Number of particles emitted per second. Default: 100. */
    emissionRate?: number;
    /** Base lifetime of a particle in seconds. Default: 2.0. */
    lifetime?: number;
    /** Random variance applied to particle lifetime. Default: 0.2. */
    lifetimeVariance?: number;
    /** Initial color of particles at spawn. Default: white. */
    startColor?: THREE.ColorRepresentation;
    /** Final color of particles before death. Default: white. */
    endColor?: THREE.ColorRepresentation;
    /** Initial size of particles at spawn. Default: 0.1. */
    startSize?: number;
    /** Final size of particles before death. Default: 0.05. */
    endSize?: number;
    /** Random variance applied to particle size. Default: 0.2. */
    sizeVariance?: number;
    /** Initial opacity of particles at spawn (0-1). Default: 1.0. */
    startOpacity?: number;
    /** Final opacity of particles before death (0-1). Default: 0.0. */
    endOpacity?: number;
    /** Shape of the emission volume ('point', 'sphere', 'box', 'cone', 'disk'). Default: 'point'. */
    shape?: EmissionShape;
    /** Specific parameters for the chosen emission shape (e.g., radius, angle). */
    shapeParams?: EmitterShapeParams;
    /** External physics forces like gravity, wind, or turbulence. */
    forces?: ParticleForces;
    /** Behavioral modifiers like attraction or color pulsing. */
    behavior?: ParticleBehavior;
    /** Optional texture for particle sprites. */
    texture?: THREE.Texture;
    /** GPU blending mode for particles. Default: AdditiveBlending. */
    blending?: THREE.Blending;
    /** Whether particles should write to the depth buffer. Default: false. */
    depthWrite?: boolean;
    /** Whether to sort particles by distance for correct transparency. Default: false. */
    sortParticles?: boolean;
    /** Whether to start emitting particles immediately on mount. Default: true. */
    autoStart?: boolean;
    /** Whether emission is currently paused. Default: false. */
    paused?: boolean;
}

/**
 * Ref interface for imperative control of the ParticleEmitter.
 * @category Effects & Atmosphere
 * @interface ParticleEmitterRef
 */
export interface ParticleEmitterRef {
    /** Access to the underlying core emitter instance. */
    emitter: CoreParticleEmitter;
    /** Emit a specific number of particles immediately. */
    emit: (count: number) => void;
    /** Emit a burst of particles instantly. */
    burst: (count: number) => void;
    /** Reset the entire system, clearing all active particles. */
    reset: () => void;
    /** Update the emitter's world position. */
    setPosition: (position: THREE.Vector3) => void;
    /** Dynamically update the emission rate. */
    setEmissionRate: (rate: number) => void;
}

function toVector3(
    value: [number, number, number] | THREE.Vector3 | undefined,
    defaultValue: THREE.Vector3
): THREE.Vector3 {
    if (!value) return defaultValue;
    if (value instanceof THREE.Vector3) return value.clone();
    return new THREE.Vector3(value[0], value[1], value[2]);
}

/**
 * GPU-accelerated particle emitter component for creating particle effects.
 * Uses instanced rendering for high performance with thousands of particles.
 *
 * @example
 * ```tsx
 * // Basic fire effect
 * <ParticleEmitter
 *   position={[0, 0, 0]}
 *   velocity={[0, 2, 0]}
 *   startColor={0xff4400}
 *   endColor={0xff0000}
 *   startSize={0.3}
 *   endSize={0.05}
 *   lifetime={1.5}
 *   emissionRate={100}
 * />
 *
 * // With forces and custom shape
 * <ParticleEmitter
 *   shape="cone"
 *   shapeParams={{ radius: 1, angle: 45 }}
 *   forces={{ gravity: [0, -9.8, 0], wind: [1, 0, 0] }}
 *   maxParticles={5000}
 * />
 * ```
 *
 * @param props - ParticleEmitterProps configuration
 * @returns React element containing the particle system
 */
export const ParticleEmitter = forwardRef<ParticleEmitterRef, ParticleEmitterProps>(
    (
        {
            position = [0, 0, 0],
            positionVariance,
            velocity = [0, 1, 0],
            velocityVariance,
            maxParticles = 1000,
            emissionRate = 100,
            lifetime = 2.0,
            lifetimeVariance = 0.2,
            startColor = 0xffffff,
            endColor = 0xffffff,
            startSize = 0.1,
            endSize = 0.05,
            sizeVariance = 0.2,
            startOpacity = 1.0,
            endOpacity = 0.0,
            shape = 'point',
            shapeParams,
            forces,
            behavior,
            texture,
            blending = THREE.AdditiveBlending,
            depthWrite = false,
            sortParticles = false,
            autoStart = true,
            paused = false,
        },
        ref
    ) => {
        const emitterRef = useRef<CoreParticleEmitter | null>(null);
        const groupRef = useRef<THREE.Group>(null);

        useEffect(() => {
            const config: ParticleEmitterConfig = {
                maxParticles,
                emissionRate: autoStart ? emissionRate : 0,
                lifetime,
                lifetimeVariance,
                position: toVector3(position, new THREE.Vector3(0, 0, 0)),
                positionVariance: toVector3(positionVariance, new THREE.Vector3(0, 0, 0)),
                velocity: toVector3(velocity, new THREE.Vector3(0, 1, 0)),
                velocityVariance: toVector3(velocityVariance, new THREE.Vector3(0.5, 0.5, 0.5)),
                startColor,
                endColor,
                startSize,
                endSize,
                sizeVariance,
                startOpacity,
                endOpacity,
                shape,
                shapeParams: shapeParams
                    ? {
                          ...shapeParams,
                          direction:
                              shapeParams.direction instanceof THREE.Vector3
                                  ? shapeParams.direction
                                  : shapeParams.direction
                                    ? new THREE.Vector3(
                                          ...(shapeParams.direction as unknown as [
                                              number,
                                              number,
                                              number,
                                          ])
                                      )
                                    : undefined,
                      }
                    : undefined,
                forces: forces
                    ? {
                          ...forces,
                          gravity:
                              forces.gravity instanceof THREE.Vector3
                                  ? forces.gravity
                                  : forces.gravity
                                    ? new THREE.Vector3(
                                          ...(forces.gravity as unknown as [number, number, number])
                                      )
                                    : undefined,
                          wind:
                              forces.wind instanceof THREE.Vector3
                                  ? forces.wind
                                  : forces.wind
                                    ? new THREE.Vector3(
                                          ...(forces.wind as unknown as [number, number, number])
                                      )
                                    : undefined,
                      }
                    : undefined,
                behavior,
                texture,
                blending,
                depthWrite,
                sortParticles,
            };

            const emitter = new CoreParticleEmitter(config);
            emitterRef.current = emitter;

            if (groupRef.current) {
                groupRef.current.add(emitter.mesh);
            }

            return () => {
                if (groupRef.current && emitter.mesh.parent === groupRef.current) {
                    groupRef.current.remove(emitter.mesh);
                }
                emitter.dispose();
            };
        }, [
            autoStart,
            behavior,
            blending,
            depthWrite,
            emissionRate,
            endColor,
            endOpacity,
            endSize,
            forces,
            lifetime,
            lifetimeVariance,
            maxParticles,
            position,
            positionVariance,
            shape,
            shapeParams,
            sizeVariance,
            sortParticles,
            startColor,
            startOpacity,
            startSize,
            texture,
            velocity,
            velocityVariance,
        ]);

        useEffect(() => {
            if (emitterRef.current) {
                emitterRef.current.setEmissionRate(paused ? 0 : emissionRate);
            }
        }, [paused, emissionRate]);

        useEffect(() => {
            if (emitterRef.current) {
                emitterRef.current.setPosition(toVector3(position, new THREE.Vector3(0, 0, 0)));
            }
        }, [position]);

        useImperativeHandle(ref, () => ({
            get emitter() {
                return emitterRef.current!;
            },
            emit(count: number) {
                emitterRef.current?.emit(count);
            },
            burst(count: number) {
                emitterRef.current?.burst(count);
            },
            reset() {
                emitterRef.current?.reset();
            },
            setPosition(pos: THREE.Vector3) {
                emitterRef.current?.setPosition(pos);
            },
            setEmissionRate(rate: number) {
                emitterRef.current?.setEmissionRate(rate);
            },
        }));

        useFrame((_, delta) => {
            if (emitterRef.current && !paused) {
                emitterRef.current.update(delta);
            }
        });

        return <group ref={groupRef} />;
    }
);

ParticleEmitter.displayName = 'ParticleEmitter';

/**
 * Props for the ParticleBurst component
 *
 * @property count - Number of particles to emit per burst
 * @property trigger - When changed to truthy value, triggers a burst
 * @property onComplete - Callback fired when burst particles have all died
 */
export interface ParticleBurstProps
    extends Omit<ParticleEmitterProps, 'emissionRate' | 'autoStart'> {
    count?: number;
    trigger?: boolean | number;
    onComplete?: () => void;
}

/**
 * Particle burst component for one-shot particle effects.
 * Useful for explosions, impacts, and other instantaneous effects.
 *
 * @example
 * ```tsx
 * // Explosion effect triggered by state
 * const [explode, setExplode] = useState(false);
 *
 * <ParticleBurst
 *   trigger={explode}
 *   count={200}
 *   position={hitPosition}
 *   velocity={[0, 5, 0]}
 *   velocityVariance={[3, 3, 3]}
 *   startColor={0xffff00}
 *   endColor={0xff0000}
 *   lifetime={0.8}
 *   onComplete={() => setExplode(false)}
 * />
 *
 * // Multiple bursts with unique keys
 * <ParticleBurst
 *   trigger={burstCount}
 *   count={50}
 *   shape="sphere"
 * />
 * ```
 *
 * @param props - ParticleBurstProps configuration
 * @returns React element containing the burst particle system
 */
export const ParticleBurst = forwardRef<ParticleEmitterRef, ParticleBurstProps>(
    ({ count = 100, trigger = false, onComplete, ...props }, ref) => {
        const emitterRef = useRef<ParticleEmitterRef>(null);
        const lastTrigger = useRef<boolean | number>(false);

        useImperativeHandle(ref, () => emitterRef.current!);

        useEffect(() => {
            if (trigger !== lastTrigger.current && trigger) {
                emitterRef.current?.burst(count);
                lastTrigger.current = trigger;
            }
        }, [trigger, count]);

        return <ParticleEmitter ref={emitterRef} {...props} emissionRate={0} autoStart={false} />;
    }
);

ParticleBurst.displayName = 'ParticleBurst';
