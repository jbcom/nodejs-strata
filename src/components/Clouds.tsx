/**
 * High-performance Cloud system.
 *
 * @packageDocumentation
 * @module components/Clouds
 * @category World Building
 *
 * ## Interactive Demos
 * - 🎮 [Live Demo](http://jonbogaty.com/nodejs-strata/demos/clouds.html)
 * - 📦 [Example Source](https://github.com/jbcom/nodejs-strata/tree/main/examples/sky-volumetrics)
 *
 * @example
 * ```tsx
 * <CloudLayer
 *   altitude={100}
 *   coverage={0.6}
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

export interface CloudLayerProps extends Partial<CloudLayerConfig> {
    /** Wind configuration */
    wind?: Partial<WindConfig>;
    /** Day/night cycle configuration */
    dayNight?: Partial<DayNightConfig>;
    /** Size of the cloud plane */
    size?: [number, number];
}

export interface VolumetricCloudsProps {
    cloudBase?: number;
    cloudHeight?: number;
    coverage?: number;
    density?: number;
    cloudColor?: THREE.Color;
    shadowColor?: THREE.Color;
    wind?: Partial<WindConfig>;
    dayNight?: Partial<DayNightConfig>;
    steps?: number;
    lightSteps?: number;
    radius?: number;
}

export interface CloudSkyProps {
    config?: Partial<CloudSkyConfig>;
    /** Override for all layers' wind */
    wind?: Partial<WindConfig>;
    /** Override for all layers' dayNight */
    dayNight?: Partial<DayNightConfig>;
}

/**
 * A single 2D cloud layer.
 * Efficient for background clouds.
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
 * Volumetric cloud system using raymarching.
 * Renders a dome of clouds around the scene.
 * @category World Building
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
 * A composite component that renders multiple cloud layers and handles
 * global wind and day/night settings.
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
