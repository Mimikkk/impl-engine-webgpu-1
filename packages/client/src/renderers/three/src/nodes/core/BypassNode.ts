import { Node } from './Node.js';

import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from './NodeBuilder.js';
import { NodeType } from './constants.js';

export class BypassNode extends Node {
  outputNode: Node;
  callNode: Node;

  constructor(returnNode: Node, callNode: Node) {
    super();

    this.outputNode = returnNode;
    this.callNode = callNode;
  }

  getNodeType(builder: NodeBuilder) {
    return this.outputNode.getNodeType(builder);
  }

  generate(builder: NodeBuilder) {
    const snippet = this.callNode.build(builder, NodeType.Void);

    if (snippet !== '') builder.addLineFlowCode(snippet);

    return this.outputNode.build(builder);
  }
}

export const bypass = nodeProxy(BypassNode);

addNodeElement('bypass', bypass);
