import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
    blendGodRayColors,
    calculateGodRayIntensityFromAngle,
    calculateRadialBlur,
    calculateScatteringIntensity,
    calculateSunOcclusion,
    createGodRaysMaterial,
    createPointLightSphereGeometry,
    createSpotlightConeGeometry,
    createVolumetricPointLightMaterial,
    createVolumetricSpotlightMaterial,
    getLightScreenPosition,
    updateGodRaysLightPosition,
} from '../core/godRays';

describe('calculateRadialBlur', () => {
    it('should calculate radial blur intensity', () => {
        const uv = new THREE.Vector2(0.7, 0.5);
        const center = new THREE.Vector2(0.5, 0.5);
        const options = {
            center,
            samples: 10,
            strength: 1.0,
        };
        const result = calculateRadialBlur(uv, center, options);
        expect(result).toBeGreaterThan(0);
    });

    it('should decrease intensity with distance from center', () => {
        const center = new THREE.Vector2(0.5, 0.5);
        const options = {
            center,
            samples: 10,
            strength: 1.0,
        };
        const near = calculateRadialBlur(new THREE.Vector2(0.6, 0.5), center, options);
        const far = calculateRadialBlur(new THREE.Vector2(0.9, 0.5), center, options);
        expect(near).toBeGreaterThan(far);
    });
});

describe('calculateSunOcclusion', () => {
    it('should calculate sun occlusion', () => {
        const sunPos = new THREE.Vector3(0, 100, -100);
        const camera = new THREE.PerspectiveCamera();

        const result = calculateSunOcclusion(sunPos, camera);
        expect(result.visible).toBeDefined();
        expect(result.factor).toBeDefined();
        expect(result.screenPosition).toBeInstanceOf(THREE.Vector2);
    });
});

describe('calculateScatteringIntensity', () => {
    it('should return high intensity when looking at light', () => {
        const viewDir = new THREE.Vector3(0, 0, -1);
        const lightDir = new THREE.Vector3(0, 0, -1);
        const intensity = calculateScatteringIntensity(viewDir, lightDir);
        expect(intensity).toBeGreaterThan(0.5);
    });

    it('should return low intensity when looking away from light', () => {
        const viewDir = new THREE.Vector3(0, 0, -1);
        const lightDir = new THREE.Vector3(0, 0, 1);
        const intensity = calculateScatteringIntensity(viewDir, lightDir);
        expect(intensity).toBeLessThan(0.5);
    });
});

describe('getLightScreenPosition', () => {
    it('should return screen position for visible light', () => {
        const lightPos = new THREE.Vector3(0, 0, -10);
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.set(0, 0, 0);
        camera.updateMatrixWorld();

        const result = getLightScreenPosition(lightPos, camera);
        expect(result).not.toBe(null);
        if (result) {
            expect(result.x).toBeGreaterThanOrEqual(0);
            expect(result.x).toBeLessThanOrEqual(1);
        }
    });

    it('should return null for light behind camera', () => {
        const lightPos = new THREE.Vector3(0, 0, 10);
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.set(0, 0, 0);
        camera.updateMatrixWorld();

        const result = getLightScreenPosition(lightPos, camera);
        expect(result).toBe(null);
    });
});

describe('calculateGodRayIntensityFromAngle', () => {
    it('should return low intensity for noon (90 deg)', () => {
        const intensity = calculateGodRayIntensityFromAngle(90, 1.0);
        expect(intensity).toBeLessThan(0.5);
    });

    it('should return high intensity for horizon (0/180 deg)', () => {
        const intensity = calculateGodRayIntensityFromAngle(0, 1.0);
        expect(intensity).toBeGreaterThan(0.5);
    });
});

describe('createGodRaysMaterial', () => {
    it('should create material with custom options', () => {
        const material = createGodRaysMaterial({
            lightPosition: new THREE.Vector3(),
            lightColor: new THREE.Color(),
            intensity: 0.8,
            decay: 0.9,
            density: 1.0,
            samples: 60,
            exposure: 1.0,
            scattering: 0.5,
            noiseFactor: 0.1,
        });
        expect(material).toBeDefined();
    });
});

describe('createVolumetricSpotlightMaterial', () => {
    it('should create material with custom options', () => {
        const material = createVolumetricSpotlightMaterial({
            lightPosition: new THREE.Vector3(),
            lightDirection: new THREE.Vector3(),
            lightColor: new THREE.Color(),
            intensity: 1.5,
            angle: Math.PI / 8,
            penumbra: 0.2,
            distance: 50,
            dustDensity: 0.1,
        });
        expect(material).toBeDefined();
    });
});

describe('createVolumetricPointLightMaterial', () => {
    it('should create material with custom options', () => {
        const material = createVolumetricPointLightMaterial({
            lightPosition: new THREE.Vector3(),
            lightColor: new THREE.Color(),
            intensity: 2.0,
            radius: 10,
            dustDensity: 0.8,
        });
        expect(material).toBeDefined();
    });
});

describe('createSpotlightConeGeometry', () => {
    it('should create cone geometry', () => {
        const geometry = createSpotlightConeGeometry(Math.PI / 6, 10);
        expect(geometry).toBeDefined();
    });
});

describe('createPointLightSphereGeometry', () => {
    it('should create sphere geometry', () => {
        const geometry = createPointLightSphereGeometry(5);
        expect(geometry).toBeInstanceOf(THREE.SphereGeometry);
    });
});

describe('updateGodRaysLightPosition', () => {
    it('should update position vector', () => {
        const target = new THREE.Vector3();
        const result = updateGodRaysLightPosition(45, 100, target);
        expect(result.x).toBeGreaterThan(0);
        expect(result.y).toBeGreaterThan(0);
    });
});

describe('blendGodRayColors', () => {
    it('should blend colors', () => {
        const baseColor = new THREE.Color(1, 0.9, 0.7);
        const atmosphereColor = new THREE.Color(1, 0.5, 0.3);
        const result = blendGodRayColors(baseColor, atmosphereColor, 30);
        expect(result).toBeInstanceOf(THREE.Color);
    });
});
