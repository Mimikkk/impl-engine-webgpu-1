import { Material } from './Material.js';
import { cloneUniforms, cloneUniformsGroups } from '../renderers/shaders/UniformsUtils.js';

import default_vertex from '../renderers/shaders/ShaderChunk/default_vertex.glsl.js';
import default_fragment from '../renderers/shaders/ShaderChunk/default_fragment.glsl.js';

export class ShaderMaterial extends Material {
  constructor(parameters) {
    super();

    this.isShaderMaterial = true;

    this.type = 'ShaderMaterial';

    this.defines = {};
    this.uniforms = {};
    this.uniformsGroups = [];

    this.vertexShader = default_vertex;
    this.fragmentShader = default_fragment;

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

    if (parameters !== undefined) {
      this.setValues(parameters);
    }
  }

  copy(source) {
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
