/**
 * High-performance GPU Instancing system for vegetation and debris.
 *
 * @packageDocumentation
 * @module components/Instancing
 * @category World Building
 *
 * ## Interactive Demos
 * - 🎮 [Live Demo](http://jonbogaty.com/nodejs-strata/demos/vegetation.html)
 * - 📦 [Example Source](https://github.com/jbcom/nodejs-strata/tree/main/examples/vegetation-showcase)
 *
 * @example
 * ```tsx
 * <GrassInstances
 *   count={10000}
 *   areaSize={200}
 * />
 * ```
 */

import { Instance, Instances } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
    type BiomeData,
    generateInstanceData as coreGenerateInstanceData,
    type InstanceData,
} from '../core/instancing';
// Import noise functions from core for use in component
import { fbm, getBiomeAt as sdfGetBiomeAt, noise3D } from '../core/sdf';

// =============================================================================
// TYPES
// =============================================================================

// Re-export types from core
export type { BiomeData, InstanceData } from '../core/instancing';

// =============================================================================
// INSTANCE GENERATION
// =============================================================================

/**
 * Generate instance data (positions, rotations, scales) based on biomes.
 *
 * @category World Building
 * @param count - Number of instances to generate.
 * @param areaSize - Size of the square area to scatter instances.
 * @param heightFunc - Function to determine terrain height at x,z.
 * @param biomes - Array of biome data for distribution.
 * @param allowedBiomes - List of biome types this instance can spawn in.
 * @param seed - Random seed.
 * @returns Array of InstanceData objects.
 */
export function generateInstanceData(
    count: number,
    areaSize: number,
    heightFunc: (x: number, z: number) => number,
    biomes?: BiomeData[],
    allowedBiomes?: string[],
    seed?: number
): InstanceData[] {
    return coreGenerateInstanceData(
        count,
        areaSize,
        heightFunc,
        biomes,
        allowedBiomes,
        seed,
        sdfGetBiomeAt as any,
        noise3D,
        fbm
    );
}

// =============================================================================
// INSTANCED MESH COMPONENT
// =============================================================================

/**
 * Props for the GPUInstancedMesh component.
 * @category World Building
 */
interface GPUInstancedMeshProps {
    /** The geometry to use for each instance */
    geometry: THREE.BufferGeometry;
    /** The material to use for each instance */
    material: THREE.Material;
    /** Maximum number of instances to render */
    count: number;
    /** Array of instance data (position, rotation, scale) */
    instances: InstanceData[];
    /**
     * Enable wind animation effect
     * @remarks Currently not implemented - reserved for future GPU shader integration
     */
    enableWind?: boolean;
    /**
     * Strength of wind animation (0-1)
     * @remarks Currently not implemented - reserved for future GPU shader integration
     */
    windStrength?: number;
    /**
     * Distance at which LOD transitions occur
     * @remarks Currently not implemented - reserved for future GPU shader integration
     */
    lodDistance?: number;
    /** Enable frustum culling */
    frustumCulled?: boolean;
    /** Enable shadow casting */
    castShadow?: boolean;
    /** Enable shadow receiving */
    receiveShadow?: boolean;
}

/**
 * Generic component for rendering large numbers of instances.
 *
 * @category World Building
 * @internal
 */
export function GPUInstancedMesh({
    geometry,
    material,
    count,
    instances,
    enableWind = true,
    windStrength = 0.5,
    lodDistance = 100,
    frustumCulled = true,
    castShadow = true,
    receiveShadow = true,
}: GPUInstancedMeshProps) {
    const _meshRef = useRef<THREE.InstancedMesh>(null);
    const _camera = useThree().camera;

    // Input validation
    if (!geometry) {
        throw new Error('GPUInstancedMesh: geometry is required');
    }
    if (!material) {
        throw new Error('GPUInstancedMesh: material is required');
    }
    if (count <= 0) {
        throw new Error('GPUInstancedMesh: count must be positive');
    }
    if (!instances || instances.length === 0) {
        throw new Error('GPUInstancedMesh: instances array cannot be empty');
    }

    const instanceCount = Math.min(instances.length, count);
    return (
        <Instances
            limit={instanceCount}
            range={instanceCount}
            frustumCulled={frustumCulled}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
        >
            {/* drei's Instances expects geometry and material as primitive children */}
            <primitive object={geometry} attach="geometry" />
            <primitive object={material} attach="material" />
            {instances.slice(0, instanceCount).map((instance, i) => (
                <Instance
                    key={i}
                    position={instance.position as unknown as [number, number, number]}
                    rotation={[instance.rotation.x, instance.rotation.y, instance.rotation.z]}
                    scale={instance.scale as unknown as [number, number, number]}
                />
            ))}
        </Instances>
    );
}

// =============================================================================
// VEGETATION COMPONENTS
// =============================================================================

/**
 * Configuration props for vegetation components.
 * @category World Building
 */
interface VegetationProps {
    /** Number of instances to generate. */
    count?: number;
    /** Size of the area to scatter instances in. */
    areaSize?: number;
    /** Biome data for placement logic. */
    biomes?: BiomeData[];
    /** Function to sample terrain height. */
    heightFunc?: (x: number, z: number) => number;
    /** Base height of the instances (for scaling geometry). */
    height?: number;
    /** Color of the instances. */
    color?: THREE.ColorRepresentation;
}

const DEFAULT_BIOMES: BiomeData[] = [
    { type: 'marsh', center: new THREE.Vector2(0, 0), radius: 30 },
    { type: 'forest', center: new THREE.Vector2(50, 0), radius: 40 },
    { type: 'savanna', center: new THREE.Vector2(60, 60), radius: 50 },
];

/**
 * Instanced grass system.
 *
 * Spawns grass blades primarily in marsh, forest, and savanna biomes.
 *
 * @category World Building
 * @example
 * ```tsx
 * <GrassInstances
 *   count={10000}
 *   areaSize={200}
 *   color={0x4a7c23}
 * />
 * ```
 */
export function GrassInstances({
    count = 10000,
    areaSize = 100,
    biomes = DEFAULT_BIOMES,
    heightFunc = () => 0,
    height = 1.0,
    color = 0x4a7c23,
}: VegetationProps) {
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const h = height;

        const positions = new Float32Array([
            -0.05,
            0,
            0,
            0.05,
            0,
            0,
            0,
            h,
            0,
            0.05,
            0,
            0,
            0.03,
            h,
            0,
            0,
            h,
            0,
        ]);

        const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

        return geo;
    }, [height]);

    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            roughness: 0.8,
            metalness: 0.0,
            side: THREE.DoubleSide,
        });
    }, [color]);

    const instances = useMemo(() => {
        return coreGenerateInstanceData(
            count,
            areaSize,
            heightFunc as any,
            biomes,
            ['marsh', 'forest', 'savanna', 'scrubland'],
            undefined, // seed
            sdfGetBiomeAt as any,
            noise3D,
            fbm
        );
    }, [count, areaSize, biomes, heightFunc]);

    // Cleanup
    useEffect(() => {
        return () => {
            geometry.dispose();
            material.dispose();
        };
    }, [geometry, material]);

    return (
        <GPUInstancedMesh
            geometry={geometry}
            material={material}
            count={count}
            instances={instances}
            enableWind={true}
            windStrength={0.3}
            lodDistance={80}
            castShadow={false}
            receiveShadow={true}
        />
    );
}

/**
 * Instanced tree system.
 *
 * Spawns simple pine-like trees primarily in forest and tundra biomes.
 *
 * @category World Building
 * @example
 * ```tsx
 * <TreeInstances count={500} />
 * ```
 */
export function TreeInstances({
    count = 500,
    areaSize = 100,
    biomes = DEFAULT_BIOMES,
    heightFunc = () => 0,
}: VegetationProps) {
    const geometry = useMemo(() => {
        // Simple tree geometry - cone for foliage
        return new THREE.ConeGeometry(1, 3, 6);
    }, []);

    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x2d5a27,
            roughness: 0.85,
            metalness: 0.0,
        });
    }, []);

    const instances = useMemo(() => {
        return coreGenerateInstanceData(
            count,
            areaSize,
            heightFunc as any,
            biomes,
            ['forest', 'tundra'],
            undefined, // seed
            sdfGetBiomeAt as any,
            noise3D,
            fbm
        );
    }, [count, areaSize, biomes, heightFunc]);

    // Cleanup
    useEffect(() => {
        return () => {
            geometry.dispose();
            material.dispose();
        };
    }, [geometry, material]);

    return (
        <GPUInstancedMesh
            geometry={geometry}
            material={material}
            count={count}
            instances={instances}
            enableWind={true}
            windStrength={0.15}
            lodDistance={150}
            castShadow={true}
            receiveShadow={true}
        />
    );
}

/**
 * Instanced rock system.
 *
 * Spawns rocks in mountain, tundra, and desert biomes.
 *
 * @category World Building
 * @example
 * ```tsx
 * <RockInstances count={200} />
 * ```
 */
export function RockInstances({
    count = 200,
    areaSize = 100,
    biomes = DEFAULT_BIOMES,
    heightFunc = () => 0,
}: VegetationProps) {
    const geometry = useMemo(() => {
        // Irregular rock geometry
        return new THREE.DodecahedronGeometry(0.5, 0);
    }, []);

    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x696969,
            roughness: 0.9,
            metalness: 0.1,
        });
    }, []);

    const instances = useMemo(() => {
        return coreGenerateInstanceData(
            count,
            areaSize,
            heightFunc as any,
            biomes,
            ['mountain', 'tundra', 'desert', 'scrubland'],
            undefined, // seed
            sdfGetBiomeAt as any,
            noise3D,
            fbm
        );
    }, [count, areaSize, biomes, heightFunc]);

    // Cleanup
    useEffect(() => {
        return () => {
            geometry.dispose();
            material.dispose();
        };
    }, [geometry, material]);

    return (
        <GPUInstancedMesh
            geometry={geometry}
            material={material}
            count={count}
            instances={instances}
            enableWind={false}
            lodDistance={120}
            castShadow={true}
            receiveShadow={true}
        />
    );
}
