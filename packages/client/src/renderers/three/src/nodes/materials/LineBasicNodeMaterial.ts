import { NodeMaterial, addNodeMaterial, ShaderMaterialParameters } from './NodeMaterial.js';

import { GLSLVersion, LineBasicMaterial, Material, UniformsGroup } from '../../Three.js';

const defaultValues = new LineBasicMaterial();

export class LineBasicNodeMaterial extends NodeMaterial {
  isLineBasicNodeMaterial: true = true;

  constructor(parameters?: ShaderMaterialParameters) {
    super();

    this.lights = false;
    this.normals = false;

    this.setDefaultValues(defaultValues);

    this.setValues(parameters);
  }
}

addNodeMaterial(LineBasicNodeMaterial);
