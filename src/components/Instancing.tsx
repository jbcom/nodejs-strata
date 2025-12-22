/**
 * High-performance GPU Instancing system for vegetation and debris.
 *
 * Efficiently renders thousands of unique objects with minimal CPU overhead
 * using GPU-driven instancing. Features automatic biome-based placement,
 * height alignment, and procedural variation.
 *
 * @packageDocumentation
 * @module components/Instancing
 * @category World Building
 *
 * ## Interactive Demos
 * - 🎮 [Live Vegetation Demo](http://jonbogaty.com/nodejs-strata/demos/vegetation.html)
 * - 📦 [Vegetation Showcase Example](https://github.com/jbcom/nodejs-strata/tree/main/examples/vegetation-showcase)
 *
 * ## API Documentation
 * - [Full API Reference](http://jonbogaty.com/nodejs-strata/api)
 * - [Examples → API Mapping](https://github.com/jbcom/nodejs-strata/blob/main/EXAMPLES_API_MAP.md#vegetation-and-instancing)
 *
 * @example
 * ```tsx
 * // Simple forest system
 * <TreeInstances
 *   count={500}
 *   areaSize={100}
 *   color={0x2d5a27}
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
/**
 * Data for a single instance (position, rotation, scale).
 * @category World Building
 */
export type { InstanceData } from '../core/instancing';

/**
 * Biome data for placement logic.
 * @category World Building
 */
export type { BiomeData } from '../core/sdf';

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
 * @param seed - Random seed for deterministic placement.
 * @returns Array of InstanceData objects.
 *
 * @example
 * ```typescript
 * const trees = generateInstanceData(
 *   500,
 *   100,
 *   (x, z) => getTerrainHeight(x, z),
 *   biomes,
 *   ['forest']
 * );
 * ```
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
 * @interface GPUInstancedMeshProps
 */
interface GPUInstancedMeshProps {
    /** The geometry to use for each instance. */
    geometry: THREE.BufferGeometry;
    /** The material to use for each instance. */
    material: THREE.Material;
    /** Maximum number of instances to render. */
    count: number;
    /** Array of instance transform data. */
    instances: InstanceData[];
    /**
     * Enable wind animation effect.
     * @remarks Requires compatible GPU shader integration. Default: true.
     */
    enableWind?: boolean;
    /**
     * Strength of wind animation (0-1). Default: 0.5.
     * @remarks Requires compatible GPU shader integration.
     */
    windStrength?: number;
    /**
     * Distance at which LOD transitions occur in units. Default: 100.
     * @remarks Requires compatible GPU shader integration.
     */
    lodDistance?: number;
    /** Enable frustum culling for the entire system. Default: true. */
    frustumCulled?: boolean;
    /** Enable shadow casting for all instances. Default: true. */
    castShadow?: boolean;
    /** Enable shadow receiving for all instances. Default: true. */
    receiveShadow?: boolean;
}

/**
 * Generic component for rendering large numbers of instances with high performance.
 *
 * Powered by `@react-three/drei`'s `Instances` component for efficient GPU batching.
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
 * @interface VegetationProps
 */
interface VegetationProps {
    /** Total number of instances to generate. Default depends on component. */
    count?: number;
    /** Size of the area (square) to scatter instances in. Default: 100. */
    areaSize?: number;
    /** Array of biome data for placement logic. Default: Standard marsh/forest/savanna set. */
    biomes?: BiomeData[];
    /** Function to sample terrain height at (x, z). Default: flat ground (y=0). */
    heightFunc?: (x: number, z: number) => number;
    /** Base height of the instances for scaling geometry. Default: 1.0. */
    height?: number;
    /** Base color of the instances. Default depends on component. */
    color?: THREE.ColorRepresentation;
}

const DEFAULT_BIOMES: BiomeData[] = [
    { type: 'marsh', center: new THREE.Vector2(0, 0), radius: 30 },
    { type: 'forest', center: new THREE.Vector2(50, 0), radius: 40 },
    { type: 'savanna', center: new THREE.Vector2(60, 60), radius: 50 },
];

/**
 * Realistic instanced grass blades with biome-aware placement.
 *
 * Automatically spawns grass primarily in marsh, forest, and savanna biomes.
 * Uses optimized GPU batching for rendering tens of thousands of blades.
 *
 * @category World Building
 * @example
 * ```tsx
 * // Lush green field
 * <GrassInstances
 *   count={20000}
 *   areaSize={100}
 *   color="#4a7c23"
 * />
 * ```
 * @see {@link TreeInstances} for forestation
 * @see {@link RockInstances} for detail elements
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
 * Procedural instanced forest system.
 *
 * Spawns pine-like tree models primarily in forest and tundra biomes.
 * Designed for background and midground density with minimal performance impact.
 *
 * @category World Building
 * @example
 * ```tsx
 * // Dense pine forest
 * <TreeInstances
 *   count={1000}
 *   areaSize={200}
 * />
 * ```
 * @see {@link GrassInstances} for ground coverage
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
 * Biome-integrated instanced rock system.
 *
 * Scatters irregular rocks in mountain, tundra, and desert biomes.
 * Adds visual detail and realism to procedural landscapes.
 *
 * @category World Building
 * @example
 * ```tsx
 * // Mountain debris
 * <RockInstances
 *   count={300}
 *   areaSize={100}
 * />
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
