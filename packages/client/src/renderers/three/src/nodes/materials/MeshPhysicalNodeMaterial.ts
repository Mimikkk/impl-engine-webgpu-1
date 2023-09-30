import { addNodeMaterial } from './NodeMaterial.js';
import { NormalNodes } from '../accessors/NormalNode.js';
import { PropertyNodes } from '../core/PropertyNode.js';
import { ExtendedMaterialNodes } from '../accessors/ExtendedMaterialNode.js';
import { MaterialNodes } from '../accessors/MaterialNode.js';
import { float, vec3 } from '../shadernode/ShaderNode.js';
import PhysicalLightingModel from '../functions/PhysicalLightingModel.js';
import MeshStandardNodeMaterial from './MeshStandardNodeMaterial.js';

import { MeshPhysicalMaterial } from '../../Three.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

const defaultValues = new MeshPhysicalMaterial();

class MeshPhysicalNodeMaterial extends MeshStandardNodeMaterial {
  constructor(parameters) {
    super();

    this.isMeshPhysicalNodeMaterial = true;

    this.clearcoatNode = null;
    this.clearcoatRoughnessNode = null;
    this.clearcoatNormalNode = null;

    this.sheenNode = null;
    this.sheenRoughnessNode = null;

    this.iridescenceNode = null;
    this.iridescenceIORNode = null;
    this.iridescenceThicknessNode = null;

    this.specularIntensityNode = null;
    this.specularColorNode = null;

    this.transmissionNode = null;
    this.thicknessNode = null;
    this.attenuationDistanceNode = null;
    this.attenuationColorNode = null;

    this.setDefaultValues(defaultValues);

    this.setValues(parameters);
  }

  constructLightingModel(builder: NodeBuilder) {
    return new PhysicalLightingModel(); // @TODO: Optimize shader using parameters.
  }

  constructVariants(builder) {
    super.constructVariants(builder);

    const { stack } = builder;

    // CLEARCOAT

    const clearcoatNode = this.clearcoatNode ? float(this.clearcoatNode) : MaterialNodes.clearcoat;
    const clearcoatRoughnessNode = this.clearcoatRoughnessNode
      ? float(this.clearcoatRoughnessNode)
      : MaterialNodes.clearcoatRoughness;

    stack.assign(PropertyNodes.clearcoat, clearcoatNode);
    stack.assign(PropertyNodes.clearcoatRoughness, clearcoatRoughnessNode);

    // SHEEN

    const sheenNode = this.sheenNode ? vec3(this.sheenNode) : MaterialNodes.sheen;
    const sheenRoughnessNode = this.sheenRoughnessNode ? float(this.sheenRoughnessNode) : MaterialNodes.sheenRoughness;

    stack.assign(PropertyNodes.sheen, sheenNode);
    stack.assign(PropertyNodes.sheenRoughness, sheenRoughnessNode);

    // IRIDESCENCE

    const iridescenceNode = this.iridescenceNode ? float(this.iridescenceNode) : MaterialNodes.iridescence;
    const iridescenceIORNode = this.iridescenceIORNode ? float(this.iridescenceIORNode) : MaterialNodes.iridescenceIor;
    const iridescenceThicknessNode = this.iridescenceThicknessNode
      ? float(this.iridescenceThicknessNode)
      : MaterialNodes.iridescenceThickness;

    stack.assign(PropertyNodes.iridescence, iridescenceNode);
    stack.assign(PropertyNodes.iridescenceIOR, iridescenceIORNode);
    stack.assign(PropertyNodes.iridescenceThickness, iridescenceThicknessNode);
  }

  constructNormal(builder) {
    super.constructNormal(builder);

    // CLEARCOAT NORMAL

    const clearcoatNormalNode = this.clearcoatNormalNode
      ? vec3(this.clearcoatNormalNode)
      : ExtendedMaterialNodes.clearcoatNormal;

    builder.stack.assign(NormalNodes.transformed.clearcoat, clearcoatNormalNode);
  }

  copy(source) {
    this.clearcoatNode = source.clearcoatNode;
    this.clearcoatRoughnessNode = source.clearcoatRoughnessNode;
    this.clearcoatNormalNode = source.clearcoatNormalNode;

    this.sheenNode = source.sheenNode;
    this.sheenRoughnessNode = source.sheenRoughnessNode;

    this.iridescenceNode = source.iridescenceNode;
    this.iridescenceIORNode = source.iridescenceIORNode;
    this.iridescenceThicknessNode = source.iridescenceThicknessNode;

    this.specularIntensityNode = source.specularIntensityNode;
    this.specularColorNode = source.specularColorNode;

    this.transmissionNode = source.transmissionNode;
    this.thicknessNode = source.thicknessNode;
    this.attenuationDistanceNode = source.attenuationDistanceNode;
    this.attenuationColorNode = source.attenuationColorNode;

    return super.copy(source);
  }
}

export default MeshPhysicalNodeMaterial;

addNodeMaterial(MeshPhysicalNodeMaterial);
