import { Material } from './Material.js';
import { cloneUniforms, cloneUniformsGroups } from './UniformsUtils.js';

import vertexShader from './ShaderMaterial.vertex.glsl?raw';
import fragmentShader from './ShaderMaterial.fragment.glsl?raw';

export class ShaderMaterial extends Material {
  isShaderMaterial: boolean;
  defines: {};
  uniforms: Record<string, any>;
  uniformsGroups: any[];
  vertexShader: any;
  fragmentShader: any;
  linewidth: number;
  wireframe: boolean;
  wireframeLinewidth: number;
  lights: boolean;
  fog: boolean;
  clipping: boolean;
  extensions: {
    derivatives: boolean; // set to use derivatives
    fragDepth: boolean; // set to use fragment depth values
    drawBuffers: boolean; // set to use draw buffers
    shaderTextureLOD: boolean;
  };
  defaultAttributeValues: { color: number[]; uv: number[]; uv1: number[] };
  index0AttributeName: undefined;
  uniformsNeedUpdate: boolean;
  glslVersion: null;
  constructor(parameters?: any) {
    super();

    this.isShaderMaterial = true;

    this.type = 'ShaderMaterial';

    this.defines = {};
    this.uniforms = {};
    this.uniformsGroups = [];

    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    this.linewidth = 1;

    this.wireframe = false;
    this.wireframeLinewidth = 1;

    this.fog = false; // set to use scene fog
    this.lights = false; // set to use scene lights
    this.clipping = false; // set to use user-defined clipping planes

    this.forceSinglePass = true;

    this.extensions = {
      derivatives: false, // set to use derivatives
      fragDepth: false, // set to use fragment depth values
      drawBuffers: false, // set to use draw buffers
      shaderTextureLOD: false, // set to use shader texture LOD
    };

    // When rendered geometry doesn't include these attributes but the material does,
    // use these default values in WebGL. This avoids errors when buffer data is missing.
    this.defaultAttributeValues = {
      color: [1, 1, 1],
      uv: [0, 0],
      uv1: [0, 0],
    };

    this.index0AttributeName = undefined;
    this.uniformsNeedUpdate = false;

    this.glslVersion = null;

    this.setValues(parameters);
  }

  copy(source: ShaderMaterial) {
    super.copy(source);

    this.fragmentShader = source.fragmentShader;
    this.vertexShader = source.vertexShader;

    this.uniforms = cloneUniforms(source.uniforms);
    this.uniformsGroups = cloneUniformsGroups(source.uniformsGroups);

    this.defines = Object.assign({}, source.defines);

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;

    this.fog = source.fog;
    this.lights = source.lights;
    this.clipping = source.clipping;

    this.extensions = Object.assign({}, source.extensions);

    this.glslVersion = source.glslVersion;

    return this;
  }
}
