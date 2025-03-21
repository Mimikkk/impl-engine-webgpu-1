import { addNodeMaterial, NodeMaterial, ShaderMaterialParameters } from './NodeMaterial.js';
import { PropertyNodes } from '../core/PropertyNode.js';
import { mix } from '../math/MathNode.js';
import { MaterialNodes } from '../accessors/MaterialNode.js';
import { getRoughness } from '../functions/material/getRoughness.js';
import { PhysicalLightingModel } from '../functions/PhysicalLightingModel.js';
import { float, vec3, vec4 } from '../shadernode/ShaderNode.js';

import { MeshStandardMaterial } from '../../Three.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { Node } from '../core/Node.js';

const defaultValues = new MeshStandardMaterial();

export class MeshStandardNodeMaterial extends NodeMaterial {
  isMeshStandardNodeMaterial: true = true;
  metalnessNode: Node | null;
  roughnessNode: Node | null;

  constructor(parameters?: ShaderMaterialParameters) {
    super();

    this.isMeshStandardNodeMaterial = true;

    this.emissiveNode = null;

    this.metalnessNode = null;
    this.roughnessNode = null;

    this.setDefaultValues(defaultValues);

    this.setValues(parameters);
  }

  constructLightingModel(builder: NodeBuilder) {
    return new PhysicalLightingModel(false, false); // ( clearcoat, sheen ) -> standard
  }

  constructVariants({ stack }: any) {
    // METALNESS

    const metalnessNode = this.metalnessNode ? float(this.metalnessNode) : MaterialNodes.metalness;
    stack.assign(PropertyNodes.metalness, metalnessNode);

    // ROUGHNESS

    let roughnessNode = this.roughnessNode ? float(this.roughnessNode) : MaterialNodes.roughness;
    roughnessNode = getRoughness({ roughness: roughnessNode });

    stack.assign(PropertyNodes.roughness, roughnessNode);

    // SPECULAR COLOR

    const specularColorNode = mix(vec3(0.04), PropertyNodes.diffuseColor.rgb, metalnessNode);

    stack.assign(PropertyNodes.specularColor, specularColorNode);

    // DIFFUSE COLOR

    stack.assign(
      PropertyNodes.diffuseColor,
      vec4(PropertyNodes.diffuseColor.rgb.mul(metalnessNode.oneMinus()), PropertyNodes.diffuseColor.a),
    );
  }

  copy(source: MeshStandardNodeMaterial) {
    this.emissiveNode = source.emissiveNode;
    this.metalnessNode = source.metalnessNode;
    this.roughnessNode = source.roughnessNode;

    return super.copy(source);
  }
}

addNodeMaterial(MeshStandardNodeMaterial);
