import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { PropertyNodes } from '../core/PropertyNode.js';
import { MaterialNodes } from '../accessors/MaterialNode.js';
import { float } from '../shadernode/ShaderNode.js';
import PhongLightingModel from '../functions/PhongLightingModel.js';

import { MeshPhongMaterial } from '../../Three.js';
import NodeBuilder from '../core/NodeBuilder.js';

const defaultValues = new MeshPhongMaterial();

class MeshPhongNodeMaterial extends NodeMaterial {
  constructor(parameters) {
    super();

    this.isMeshPhongNodeMaterial = true;

    this.lights = true;

    this.shininessNode = null;
    this.specularNode = null;

    this.setDefaultValues(defaultValues);

    this.setValues(parameters);
  }

  constructLightingModel(builder: NodeBuilder) {
    return new PhongLightingModel();
  }

  constructVariants({ stack }) {
    // SHININESS

    const shininessNode = (this.shininessNode ? float(this.shininessNode) : MaterialNodes.shininess).max(1e-4); // to prevent pow( 0.0, 0.0 )

    stack.assign(PropertyNodes.shininess, shininessNode);

    // SPECULAR COLOR

    const specularNode = this.specularNode || MaterialNodes.specularColor;

    stack.assign(PropertyNodes.specularColor, specularNode);
  }

  copy(source) {
    this.shininessNode = source.shininessNode;
    this.specularNode = source.specularNode;

    return super.copy(source);
  }
}

export default MeshPhongNodeMaterial;

addNodeMaterial(MeshPhongNodeMaterial);
