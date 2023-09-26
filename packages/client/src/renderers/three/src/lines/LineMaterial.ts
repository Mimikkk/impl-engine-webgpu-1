/**
 * parameters = {
 *  color: <hex>,
 *  linewidth: <float>,
 *  dashed: <boolean>,
 *  dashScale: <float>,
 *  dashSize: <float>,
 *  dashOffset: <float>,
 *  gapSize: <float>,
 *  resolution: <Vector2>, // to be set by renderer
 * }
 */

import { Material, ShaderLib, ShaderMaterial, UniformsUtils, Vector2 } from '../Three.js';

export class LineMaterial extends ShaderMaterial {
  isLineMaterial: boolean;
  type: string | 'LineMaterial';
  worldUnits: boolean;
  linewidth: number;
  dashed: boolean;
  dashScale: number;
  dashSize: number;
  dashOffset: number;
  gapSize: number;
  opacity: number;
  resolution: Vector2;
  alphaToCoverage: boolean;

  constructor(parameters?: Material.Parameters) {
    super();
    this.clipping = true;
    this.uniforms = UniformsUtils.clone(ShaderLib.line.uniforms);
    this.vertexShader = ShaderLib.line.vertexShader;
    this.fragmentShader = ShaderLib.line.fragmentShader;

    this.type = 'LineMaterial';
    this.isLineMaterial = true;

    Object.defineProperties(this, {
      color: {
        enumerable: true,

        get: function () {
          return this.uniforms.diffuse.value;
        },

        set: function (value) {
          this.uniforms.diffuse.value = value;
        },
      },

      worldUnits: {
        enumerable: true,
        get: () => 'WORLD_UNITS' in this.defines,
        set(value: boolean) {
          if (value) {
            this.defines.WORLD_UNITS = '';
            return;
          }
          delete this.defines.WORLD_UNITS;
        },
      },

      linewidth: {
        enumerable: true,
        get: () => this.uniforms.linewidth.value,
        set: value => (this.uniforms.linewidth.value = value),
      },

      dashed: {
        enumerable: true,
        get: () => 'USE_DASH' in this.defines,
        set(value: boolean) {
          if (value !== 'USE_DASH' in this.defines) {
            this.needsUpdate = true;
          }

          if (value) {
            this.defines.USE_DASH = '';
          } else {
            delete this.defines.USE_DASH;
          }
        },
      },

      dashScale: {
        enumerable: true,
        get: () => this.uniforms.dashScale.value,
        set: value => (this.uniforms.dashScale.value = value),
      },
      dashSize: {
        enumerable: true,
        get: () => this.uniforms.dashSize.value,
        set: value => (this.uniforms.dashSize.value = value),
      },
      dashOffset: {
        enumerable: true,
        get: () => this.uniforms.dashOffset.value,
        set: value => (this.uniforms.dashOffset.value = value),
      },

      gapSize: {
        enumerable: true,
        get: () => this.uniforms.gapSize.value,
        set: value => (this.uniforms.gapSize.value = value),
      },

      opacity: {
        enumerable: true,
        get: () => this.uniforms.opacity.value,
        set: value => {
          this.uniforms.opacity.value = value;
        },
      },

      resolution: {
        enumerable: true,
        get: () => this.uniforms.resolution.value,
        set: value => this.uniforms.resolution.value.copy(value),
      },

      alphaToCoverage: {
        enumerable: true,
        get: () => 'USE_ALPHA_TO_COVERAGE' in this.defines,
        set: (value: boolean) => {
          if (value !== 'USE_ALPHA_TO_COVERAGE' in this.defines) {
            this.needsUpdate = true;
          }

          if (value) {
            this.defines.USE_ALPHA_TO_COVERAGE = '';
            this.extensions.derivatives = true;
          } else {
            delete this.defines.USE_ALPHA_TO_COVERAGE;
            this.extensions.derivatives = false;
          }
        },
      },
    });

    this.setValues(parameters);
  }
}
