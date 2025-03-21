import { Color } from '../../math/Color.js';
import { Vector2 } from '../../math/Vector2.js';
import { Matrix3 } from '../../math/Matrix3.js';

export namespace UniformsLib {
  export const common = {
    diffuse: { value: new Color(0xffffff) },
    opacity: { value: 1.0 },

    map: { value: null },
    mapTransform: { value: new Matrix3() },

    alphaMap: { value: null },
    alphaMapTransform: { value: new Matrix3() },

    alphaTest: { value: 0 },
  };

  export const specularmap = {
    specularMap: { value: null },
    specularMapTransform: { value: new Matrix3() },
  };

  export const envmap = {
    envMap: { value: null },
    flipEnvMap: { value: -1 },
    reflectivity: { value: 1.0 }, // basic, lambert, phong
    ior: { value: 1.5 }, // physical
    refractionRatio: { value: 0.98 }, // basic, lambert, phong
  };

  export const aomap = {
    aoMap: { value: null },
    aoMapIntensity: { value: 1 },
    aoMapTransform: { value: new Matrix3() },
  };

  export const lightmap = {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: new Matrix3() },
  };

  export const bumpmap = {
    bumpMap: { value: null },
    bumpMapTransform: { value: new Matrix3() },
    bumpScale: { value: 1 },
  };

  export const normalmap = {
    normalMap: { value: null },
    normalMapTransform: { value: new Matrix3() },
    normalScale: { value: new Vector2(1, 1) },
  };

  export const displacementmap = {
    displacementMap: { value: null },
    displacementMapTransform: { value: new Matrix3() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 },
  };

  export const emissivemap = {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: new Matrix3() },
  };

  export const metalnessmap = {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: new Matrix3() },
  };

  export const roughnessmap = {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: new Matrix3() },
  };

  export const gradientmap = {
    gradientMap: { value: null },
  };

  export const fog = {
    fogDensity: { value: 0.00025 },
    fogNear: { value: 1 },
    fogFar: { value: 2000 },
    fogColor: { value: new Color(0xffffff) },
  };

  export const lights = {
    ambientLightColor: { value: [] },

    lightProbe: { value: [] },

    directionalLights: {
      value: [],
      properties: {
        direction: {},
        color: {},
      },
    },

    directionalLightShadows: {
      value: [],
      properties: {
        shadowBias: {},
        shadowNormalBias: {},
        shadowRadius: {},
        shadowMapSize: {},
      },
    },

    directionalShadowMap: { value: [] },
    directionalShadowMatrix: { value: [] },

    spotLights: {
      value: [],
      properties: {
        color: {},
        position: {},
        direction: {},
        distance: {},
        coneCos: {},
        penumbraCos: {},
        decay: {},
      },
    },

    spotLightShadows: {
      value: [],
      properties: {
        shadowBias: {},
        shadowNormalBias: {},
        shadowRadius: {},
        shadowMapSize: {},
      },
    },

    spotLightMap: { value: [] },
    spotShadowMap: { value: [] },
    spotLightMatrix: { value: [] },

    pointLights: {
      value: [],
      properties: {
        color: {},
        position: {},
        decay: {},
        distance: {},
      },
    },

    pointLightShadows: {
      value: [],
      properties: {
        shadowBias: {},
        shadowNormalBias: {},
        shadowRadius: {},
        shadowMapSize: {},
        shadowCameraNear: {},
        shadowCameraFar: {},
      },
    },

    pointShadowMap: { value: [] },
    pointShadowMatrix: { value: [] },

    hemisphereLights: {
      value: [],
      properties: {
        direction: {},
        skyColor: {},
        groundColor: {},
      },
    },

    // TODO (abelnation): RectAreaLight BRDF data needs to be moved from example to main src
    rectAreaLights: {
      value: [],
      properties: {
        color: {},
        position: {},
        width: {},
        height: {},
      },
    },

    ltc_1: { value: null },
    ltc_2: { value: null },
  };

  export const points = {
    diffuse: { value: new Color(0xffffff) },
    opacity: { value: 1.0 },
    size: { value: 1.0 },
    scale: { value: 1.0 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: new Matrix3() },
    alphaTest: { value: 0 },
    uvTransform: { value: new Matrix3() },
  };

  export const sprite = {
    diffuse: { value: new Color(0xffffff) },
    opacity: { value: 1.0 },
    center: { value: new Vector2(0.5, 0.5) },
    rotation: { value: 0.0 },
    map: { value: null },
    mapTransform: { value: new Matrix3() },
    alphaMap: { value: null },
    alphaMapTransform: { value: new Matrix3() },
    alphaTest: { value: 0 },
  };

  export const line = {
    worldUnits: { value: 1 },
    linewidth: { value: 1 },
    resolution: { value: new Vector2(1, 1) },
    dashOffset: { value: 0 },
    dashScale: { value: 1 },
    dashSize: { value: 1 },
    gapSize: { value: 1 },
  };
}
