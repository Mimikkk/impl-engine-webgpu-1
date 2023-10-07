import { Node } from '../core/Node.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

export class ArrayElementNode extends Node {
  node: Node;
  index: Node;

  constructor(node: Node, indexNode: Node) {
    super();

    this.node = node;
    this.index = indexNode;
  }

  getNodeType(builder: NodeBuilder) {
    return this.node.getNodeType(builder);
  }

  generate(builder: NodeBuilder) {
    const nodeSnippet = this.node.build(builder);
    const indexSnippet = this.index.build(builder, NodeType.UnsignedInteger);

    return `${nodeSnippet}[ ${indexSnippet} ]`;
  }
}
