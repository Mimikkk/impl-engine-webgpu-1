import { Node } from './Node.js';

import { NodeShaderStage } from './constants.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import NodeBuilder from './NodeBuilder.js';

class VaryingNode extends Node {
  node: Node;
  name: string | null;

  constructor(node: Node, name: string | null = null) {
    super();

    this.node = node;
    this.name = name;
  }

  isGlobal() {
    return true;
  }

  getHash(builder: NodeBuilder) {
    return this.name || super.getHash(builder);
  }

  getNodeType(builder: NodeBuilder) {
    // VaryingNode is auto type

    return this.node.getNodeType(builder);
  }

  generate(builder: NodeBuilder) {
    const { name, node } = this;
    const type = this.getNodeType(builder);

    const nodeVarying = builder.getVaryingFromNode(this, type);

    // this property can be used to check if the varying can be optimized for a var
    nodeVarying.needsInterpolation || (nodeVarying.needsInterpolation = builder.shaderStage === 'fragment');

    if (name !== null) {
      nodeVarying.name = name;
    }

    const propertyName = builder.getPropertyName(nodeVarying, NodeShaderStage.Vertex);

    // force node run in vertex stage
    builder.flowNodeFromShaderStage(NodeShaderStage.Vertex, node, type, propertyName);

    return builder.getPropertyName(nodeVarying);
  }
}

export default VaryingNode;

export const varying = nodeProxy(VaryingNode);

addNodeElement('varying', varying);
