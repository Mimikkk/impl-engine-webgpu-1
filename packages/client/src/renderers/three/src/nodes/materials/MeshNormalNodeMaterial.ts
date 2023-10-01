import { NodeMaterial, addNodeMaterial, ShaderMaterialParameters } from './NodeMaterial.js';
import { PropertyNodes } from '../core/PropertyNode.js';
import { directionToColor } from '../utils/PackingNode.js';
import { MaterialNodes } from '../accessors/MaterialNode.js';
import { NormalNodes } from '../accessors/NormalNode.js';
import { float, vec4 } from '../shadernode/ShaderNode.js';

import { MeshNormalMaterial } from '../../Three.js';

const defaultValues = new MeshNormalMaterial();

export class MeshNormalNodeMaterial extends NodeMaterial {
  isMeshNormalNodeMaterial: true = true;

  constructor(parameters?: ShaderMaterialParameters) {
    super();

    this.isMeshNormalNodeMaterial = true;

    this.colorSpace = false;

    this.setDefaultValues(defaultValues);

    this.setValues(parameters);
  }

  constructDiffuseColor({ stack }: any) {
    const opacityNode = this.opacityNode ? float(this.opacityNode) : MaterialNodes.opacity;

    stack.assign(PropertyNodes.diffuseColor, vec4(directionToColor(NormalNodes.transformed.view), opacityNode));
  }
}

addNodeMaterial(MeshNormalNodeMaterial);
