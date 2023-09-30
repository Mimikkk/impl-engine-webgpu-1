import { Node } from '../core/Node.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

class ArrayElementNode extends Node {
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
    const indexSnippet = this.index.build(builder, 'uint');

    return `${nodeSnippet}[ ${indexSnippet} ]`;
  }
}

export default ArrayElementNode;
