/**
 * Core Mathematical and Procedural Generation Utilities.
 */

// 1. Foundation & Math
export * from './math/index';
export * from './shared/index';
export * from './stateMachine';

// 2. Core Systems
export * from './ecs/index';
export * from './state/index';
export * from './input';

// 3. Animation & Physics
export {
    type BoneChain,
    type BoneConstraint,
    type IKSolverResult,
    type SpringConfig,
    type SpringState,
    type GaitConfig,
    type GaitState,
    type LookAtConfig,
    type LookAtState,
    createBoneChain,
    createBoneChainFromLengths,
    FABRIKSolver,
    CCDSolver,
    TwoBoneIKSolver,
    LookAtController,
    SpringDynamics,
    SpringChain,
    ProceduralGait,
    clampAngle,
    dampedSpring,
    dampedSpringVector3,
    hermiteInterpolate,
    sampleCurve,
    calculateBoneRotation,
} from './animation/index';
export * from './physics';

// 4. Rendering & Effects
export * from './audio/index';
export {
    CameraShake,
    type CameraShakeConfig,
    type FOVTransitionConfig,
    type CameraPath,
    FOVTransition,
    type ScreenShakeIntensity,
} from './camera';
export {
    type CloudLayerConfig,
    type CloudMaterialOptions,
    type VolumetricCloudOptions,
    type CloudSkyConfig,
    type DayNightConfig,
    createCloudLayerMaterial,
    createVolumetricCloudMaterial,
    createCloudLayerGeometry,
    createVolumetricCloudGeometry,
    adaptCloudColorsForTimeOfDay,
    calculateWindOffset,
    fbmNoise2D,
    sampleCloudDensity,
    createDefaultCloudSkyConfig,
} from './clouds';
export * from './decals';
export * from './godRays';
export {
    type InstanceData,
    type InstancingOptions,
    generateInstanceData,
    createInstancedMesh,
} from './instancing';
export * from './lod';
export * from './marching-cubes';
export * from './particles';
export * from './postProcessing';
export * from './raymarching';
export {
    sdSphere,
    sdBox,
    sdPlane,
    sdCapsule,
    sdTorus,
    sdCone,
    opUnion,
    opSubtraction,
    opIntersection,
    opSmoothUnion,
    opSmoothSubtraction,
    opSmoothIntersection,
    sdCaves,
    sdTerrain,
    sdRock,
    calcNormal,
    type BiomeData,
} from './sdf';
export * from './shaders';
export * from './sky';
export * from './volumetrics';
export * from './water';
export {
    type WeatherType,
    type WeatherStateConfig,
    type WeatherTransition,
    WeatherSystem,
    createWeatherSystem,
    WindSimulation,
    createWindSimulation,
    type TemperatureConfig,
    calculateTemperature,
    getPrecipitationType,
} from './weather';

// 5. UI Logic
export {
    type UIAnchor,
    type TextDirection,
    type ProgressBarConfig,
    type InventorySlot,
    type InventoryConfig,
    type DialogLine,
    type DialogChoice,
    type DialogConfig,
    type TooltipConfig,
    type NotificationConfig,
    type MinimapConfig,
    type MinimapMarker,
    type CrosshairConfig,
    type DamageNumberConfig,
    type NameplateConfig,
    type ScreenPosition,
    getAnchorOffset,
    createDefaultProgressBar,
    createDefaultInventory,
    createDefaultDialog,
    createDefaultTooltip,
    createDefaultNotification,
    createDefaultMinimap,
    createDefaultCrosshair,
    createDefaultDamageNumber,
    createDefaultNameplate,
    getDamageNumberColor,
    formatNumber,
    getNotificationIcon,
    getNotificationColor,
} from './ui';
