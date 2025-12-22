/**
 * @module Effects
 * @category Effects & Atmosphere
 *
 * Effects & Atmosphere - Particles, Weather, Lighting, and Decals
 *
 * Visual effects that bring your world to life - from rain and snow
 * to explosions and god rays.
 */

// Import core types directly to avoid circular dependency or missing re-exports
import * as Core from '../core';
import * as Components from '../components';

// Weather state from components
export type {
    AnimatedBillboardProps,
    AnimatedBillboardRef,
    BillboardProps,
    BillboardRef,
    DecalPoolProps,
    DecalPoolRef,
    DecalProps,
    DecalRef,
    GodRaysProps,
    GodRaysRef,
    ImpostorProps,
    ImpostorRef,
    LightningProps,
    LODGroupProps,
    LODGroupRef,
    LODMeshProps,
    LODMeshRef,
    LODVegetationProps,
    LODVegetationRef,
    ParticleBurstProps,
    ParticleEmitterProps,
    ParticleEmitterRef,
    RainProps,
    SnowProps,
    VolumetricPointLightProps,
    VolumetricPointLightRef,
    VolumetricSpotlightProps,
    VolumetricSpotlightRef,
    WeatherState,
    WeatherSystemProps,
} from '../components';

export {
    AnimatedBillboard,
    Billboard,
    Decal,
    DecalPool,
    GodRays,
    Impostor,
    Lightning,
    LODGroup,
    LODMesh,
    LODVegetation,
    ParticleBurst,
    ParticleEmitter,
    Rain,
    Snow,
    VolumetricPointLight,
    VolumetricSpotlight,
} from '../components';

export type {
    GodRaysMaterialOptions,
    OcclusionResult,
    RadialBlurOptions,
    ScatteringParams,
    VolumetricPointLightMaterialOptions,
    VolumetricSpotlightMaterialOptions,
    WeatherType,
    WeatherTransition,
} from '../core';

export {
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
    createWeatherSystem,
    getPrecipitationType,
} from '../core';
