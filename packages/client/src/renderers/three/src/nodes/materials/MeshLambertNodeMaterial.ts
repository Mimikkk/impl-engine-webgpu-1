import { NodeMaterial, addNodeMaterial, ShaderMaterialParameters } from './NodeMaterial.js';
import { PhongLightingModel } from '../functions/PhongLightingModel.js';

import { MeshLambertMaterial } from '../../Three.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

const defaultValues = new MeshLambertMaterial();

export class MeshLambertNodeMaterial extends NodeMaterial {
  isMeshLambertNodeMaterial: true = true;

  constructor(parameters?: ShaderMaterialParameters) {
    super();

    this.isMeshLambertNodeMaterial = true;

    this.lights = true;

    this.setDefaultValues(defaultValues);

    this.setValues(parameters);
  }

  constructLightingModel(builder: NodeBuilder) {
    return new PhongLightingModel(false); // ( specular ) -> force lambert
  }
}

addNodeMaterial(MeshLambertNodeMaterial);
