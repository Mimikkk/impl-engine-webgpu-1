import { TempNode } from '../core/TempNode.js';
import { Node } from '../core/Node.js';
import { NodeType } from '../core/constants.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

export class JoinNode extends TempNode {
  nodes: Node[];

  constructor(nodes: Node[] = [], nodeType: NodeType) {
    super(nodeType);

    this.nodes = nodes;
  }

  getNodeType(builder: NodeBuilder) {
    if (this.nodeType !== null) {
      return builder.getVectorType(this.nodeType);
    }

    return builder.getTypeFromLength(
      this.nodes.reduce((count, cur) => count + builder.getTypeLength(cur.getNodeType(builder)), 0),
    );
  }

  generate(builder: NodeBuilder, output?: NodeType) {
    const type = this.getNodeType(builder);

    const snippet = `${builder.getType(type)}(${this.nodes.map(input => input.build(builder)).join(', ')})`;

    return builder.format(snippet, type, output);
  }
}
