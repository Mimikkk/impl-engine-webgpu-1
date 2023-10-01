import { NodeMaterial, addNodeMaterial, ShaderMaterialParameters } from './NodeMaterial.js';

import { MeshBasicMaterial } from '../../Three.js';

const defaultValues = new MeshBasicMaterial();

export class MeshBasicNodeMaterial extends NodeMaterial {
  isMeshBasicNodeMaterial: true = true;

  constructor(parameters?: ShaderMaterialParameters) {
    super();

    this.isMeshBasicNodeMaterial = true;

    this.lights = false;

    this.setDefaultValues(defaultValues);

    this.setValues(parameters);
  }
}

addNodeMaterial(MeshBasicNodeMaterial);
