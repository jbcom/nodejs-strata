/**
 * High-performance Cloud system for procedural atmospheres.
 *
 * Provides specialized components for rendering both efficient 2D cloud layers
 * and immersive 3D volumetric clouds using GPU-accelerated raymarching.
 *
 * @packageDocumentation
 * @module components/Clouds
 * @category World Building
 *
 * ## Interactive Demos
 * - 🎮 [Live Clouds Demo](http://jonbogaty.com/nodejs-strata/demos/clouds.html)
 * - 📦 [Sky & Volumetrics Example](https://github.com/jbcom/nodejs-strata/tree/main/examples/sky-volumetrics)
 *
 * ## API Documentation
 * - [Full API Reference](http://jonbogaty.com/nodejs-strata/api)
 *
 * @example
 * ```tsx
 * // Simple 2D layer
 * <CloudLayer
 *   altitude={150}
 *   coverage={0.6}
 *   density={1.2}
 * />
 * ```
 */

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
    type CloudLayerConfig,
    type CloudSkyConfig,
    type DayNightConfig,
    type WindConfig,
    calculateWindOffset,
    createCloudLayerGeometry,
    createCloudLayerMaterial,
    createDefaultCloudSkyConfig,
    createVolumetricCloudGeometry,
    createVolumetricCloudMaterial,
} from '../core/clouds';

/**
 * Props for the CloudLayer component.
 * @category World Building
 * @interface CloudLayerProps
 */
export interface CloudLayerProps extends Partial<CloudLayerConfig> {
    /** Wind configuration for cloud movement animation. */
    wind?: Partial<WindConfig>;
    /** Day/night cycle configuration for cloud lighting and color adaptation. */
    dayNight?: Partial<DayNightConfig>;
    /** Size of the cloud plane [width, height]. Default: [200, 200]. */
    size?: [number, number];
}

/**
 * Props for the VolumetricClouds component.
 * @category World Building
 * @interface VolumetricCloudsProps
 */
export interface VolumetricCloudsProps {
    /** Base altitude where clouds start. Default: 50. */
    cloudBase?: number;
    /** Total height/thickness of the cloud volume. Default: 50. */
    cloudHeight?: number;
    /** Cloud coverage density (0-1). Default: 0.5. */
    coverage?: number;
    /** Cloud internal density multiplier. Default: 1.0. */
    density?: number;
    /** Primary cloud color. Default: white. */
    cloudColor?: THREE.Color;
    /** Cloud shadow color. Default: slate blue. */
    shadowColor?: THREE.Color;
    /** Wind configuration for movement animation. */
    wind?: Partial<WindConfig>;
    /** Day/night cycle configuration for light intensity and angle. */
    dayNight?: Partial<DayNightConfig>;
    /** Raymarching steps. Higher = better quality, lower performance. Default: 32. */
    steps?: number;
    /** Light sampling steps for internal shadows. Default: 4. */
    lightSteps?: number;
    /** Radius of the cloud dome sphere. Default: 500. */
    radius?: number;
}

/**
 * Props for the CloudSky composite component.
 * @category World Building
 * @interface CloudSkyProps
 */
export interface CloudSkyProps {
    /** Preset configuration containing multiple layers and global settings. */
    config?: Partial<CloudSkyConfig>;
    /** Global wind override for all cloud layers. */
    wind?: Partial<WindConfig>;
    /** Global day/night override for all cloud layers. */
    dayNight?: Partial<DayNightConfig>;
}

/**
 * Optimized 2D procedural cloud layer.
 *
 * Efficiently renders background clouds using a single textured plane.
 * Best for performance-constrained environments or background atmosphere.
 *
 * @category World Building
 */
export function CloudLayer({
    altitude = 100,
    density = 1.0,
    coverage = 0.5,
    cloudColor = new THREE.Color(1, 1, 1),
    shadowColor = new THREE.Color(0.7, 0.75, 0.85),
    scale = 5.0,
    wind: windProp = {},
    dayNight: dayNightProp = {},
    size = [200, 200],
}: CloudLayerProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Memoize config objects
    const layerConfig = useMemo(
        () => ({
            altitude,
            density,
            coverage,
            cloudColor,
            shadowColor,
            scale,
        }),
        [altitude, density, coverage, cloudColor, shadowColor, scale]
    );

    const windConfig = useMemo(
        () => ({
            direction: new THREE.Vector2(1, 0),
            speed: 0.01,
            ...windProp,
        }),
        [windProp]
    );

    const dayNightConfig = useMemo(
        () => ({
            sunIntensity: 1.0,
            sunAngle: 60,
            sunColor: new THREE.Color(1, 0.95, 0.8),
            ...dayNightProp,
        }),
        [dayNightProp]
    );

    const material = useMemo(() => {
        return createCloudLayerMaterial({
            layer: layerConfig,
            wind: windConfig,
            dayNight: dayNightConfig,
        });
    }, [layerConfig, windConfig, dayNightConfig]);

    const geometry = useMemo(() => {
        return createCloudLayerGeometry(size);
    }, [size]);

    useFrame((state) => {
        if (meshRef.current && material.uniforms) {
            material.uniforms.uTime.value = state.clock.elapsedTime;

            // Update uniforms that might change frequently
            material.uniforms.uSunIntensity.value = dayNightConfig.sunIntensity;
            material.uniforms.uSunAngle.value = dayNightConfig.sunAngle;
            material.uniforms.uSunColor.value = dayNightConfig.sunColor;

            // Update wind if needed (though it's usually handled by shader + time)
            if (windProp.direction) material.uniforms.uWindDirection.value = windConfig.direction;
            if (windProp.speed) material.uniforms.uWindSpeed.value = windConfig.speed;
        }
    });

    useEffect(() => {
        return () => {
            material.dispose();
            geometry.dispose();
        };
    }, [material, geometry]);

    return (
        <mesh
            ref={meshRef as any}
            position={[0, altitude, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            geometry={geometry as any}
        >
            <primitive object={material} attach="material" />
        </mesh>
    );
}

/**
 * Volumetric cloud system using advanced raymarching.
 *
 * Renders a full 3D cloud dome surrounding the viewer with internal light scattering,
 * self-shadowing, and dynamic movement.
 *
 * @category World Building
 * @example
 * ```tsx
 * <VolumetricClouds
 *   cloudBase={100}
 *   cloudHeight={80}
 *   coverage={0.4}
 *   steps={64}
 * />
 * ```
 */
export function VolumetricClouds({
    cloudBase = 50,
    cloudHeight = 50,
    coverage = 0.5,
    density = 1.0,
    cloudColor = new THREE.Color(1, 1, 1),
    shadowColor = new THREE.Color(0.6, 0.65, 0.75),
    wind: windProp = {},
    dayNight: dayNightProp = {},
    steps = 32,
    lightSteps = 4,
    radius = 500,
}: VolumetricCloudsProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    const windConfig = useMemo(
        () => ({
            direction: new THREE.Vector2(1, 0),
            speed: 0.01,
            ...windProp,
        }),
        [windProp]
    );

    const dayNightConfig = useMemo(
        () => ({
            sunIntensity: 1.0,
            sunAngle: 60,
            sunColor: new THREE.Color(1, 0.95, 0.8),
            ...dayNightProp,
        }),
        [dayNightProp]
    );

    const material = useMemo(() => {
        return createVolumetricCloudMaterial({
            cloudBase,
            cloudHeight,
            coverage,
            density,
            cloudColor,
            shadowColor,
            wind: windConfig,
            dayNight: dayNightConfig,
            steps,
            lightSteps,
        });
    }, [
        cloudBase,
        cloudHeight,
        coverage,
        density,
        cloudColor,
        shadowColor,
        windConfig,
        dayNightConfig,
        steps,
        lightSteps,
    ]);

    const geometry = useMemo(() => {
        return createVolumetricCloudGeometry(radius);
    }, [radius]);

    useFrame((state) => {
        if (meshRef.current && material.uniforms) {
            material.uniforms.uTime.value = state.clock.elapsedTime;
            material.uniforms.uSunIntensity.value = dayNightConfig.sunIntensity;
            material.uniforms.uSunAngle.value = dayNightConfig.sunAngle;
            material.uniforms.uSunColor.value = dayNightConfig.sunColor;
        }
    });

    useEffect(() => {
        return () => {
            material.dispose();
            geometry.dispose();
        };
    }, [material, geometry]);

    return (
        <mesh ref={meshRef as any} geometry={geometry as any} renderOrder={-2}>
            <primitive object={material} attach="material" />
        </mesh>
    );
}

/**
 * High-level component for rendering a complete multi-layered cloud sky.
 *
 * Simplifies the management of complex procedural skies by coordinating multiple
 * `CloudLayer` instances with unified global wind and lighting parameters.
 *
 * @category World Building
 */
export function CloudSky({
    config: configProp,
    wind: windOverride,
    dayNight: dayNightOverride,
}: CloudSkyProps) {
    const config = useMemo(() => {
        return configProp ? { ...createDefaultCloudSkyConfig(), ...configProp } : createDefaultCloudSkyConfig();
    }, [configProp]);

    const finalWind = useMemo(() => {
        return windOverride ? { ...config.wind, ...windOverride } : config.wind;
    }, [config.wind, windOverride]);

    const finalDayNight = useMemo(() => {
        return dayNightOverride ? { ...config.dayNight, ...dayNightOverride } : config.dayNight;
    }, [config.dayNight, dayNightOverride]);

    return (
        <group>
            {config.layers.map((layer, index) => (
                <CloudLayer
                    key={index}
                    {...layer}
                    wind={finalWind}
                    dayNight={finalDayNight}
                />
            ))}
        </group>
    );
}
