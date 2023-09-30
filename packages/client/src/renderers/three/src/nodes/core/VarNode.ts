import { Node } from './Node.js';

import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import NodeBuilder from './NodeBuilder.js';
import TempNode from './TempNode.js';

class VarNode extends Node {
  node: Node;
  name: string | null;

  constructor(node: Node, name: string | null = null) {
    super();

    this.node = node;
    this.name = name;
  }

  assign(node: Node) {
    node.traverse((childNode: Node, replaceNode: (node: Node) => void) => {
      if (replaceNode && childNode.uuid === this.uuid) replaceNode(this.node);
    });
    this.node = node;
    return this;
  }

  isGlobal() {
    return true;
  }

  getHash(builder: NodeBuilder) {
    return this.name || super.getHash(builder);
  }

  getNodeType(builder: NodeBuilder) {
    return this.node.getNodeType(builder);
  }

  generate(builder: NodeBuilder) {
    const node = this.node;
    const name = this.name;

    if (name === null && TempNode.is(node)) {
      return node.build(builder);
    }

    const type = builder.getVectorType(this.getNodeType(builder));

    const snippet = node.build(builder, type);
    const nodeVar = builder.getVarFromNode(this, type);

    if (name !== null) {
      nodeVar.name = name;
    }

    const propertyName = builder.getPropertyName(nodeVar);

    builder.addLineFlowCode(`${propertyName} = ${snippet}`);

    return propertyName;
  }
}

export default VarNode;

export const temp = nodeProxy(VarNode);

addNodeElement('temp', temp);
