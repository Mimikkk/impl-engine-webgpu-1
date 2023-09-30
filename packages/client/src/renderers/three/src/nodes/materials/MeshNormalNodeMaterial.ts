import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { PropertyNodes } from '../core/PropertyNode.js';
import { directionToColor } from '../utils/PackingNode.js';
import { MaterialNodes } from '../accessors/MaterialNode.js';
import { NormalNodes } from '../accessors/NormalNode.js';
import { float, vec4 } from '../shadernode/ShaderNode.js';

import { MeshNormalMaterial } from '../../Three.js';

const defaultValues = new MeshNormalMaterial();

class MeshNormalNodeMaterial extends NodeMaterial {
  constructor(parameters) {
    super();

    this.isMeshNormalNodeMaterial = true;

    this.colorSpace = false;

    this.setDefaultValues(defaultValues);

    this.setValues(parameters);
  }

  constructDiffuseColor({ stack }) {
    const opacityNode = this.opacityNode ? float(this.opacityNode) : MaterialNodes.opacity;

    stack.assign(PropertyNodes.diffuseColor, vec4(directionToColor(NormalNodes.transformed.view), opacityNode));
  }
}

export default MeshNormalNodeMaterial;

addNodeMaterial(MeshNormalNodeMaterial);
