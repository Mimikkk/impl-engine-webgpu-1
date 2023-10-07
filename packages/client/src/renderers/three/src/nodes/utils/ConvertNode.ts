import { Node } from '../core/Node.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

export class ConvertNode extends Node {
  node: Node;
  convertTo: string;

  constructor(node: Node, convertTo: string) {
    super();

    this.node = node;
    this.convertTo = convertTo;
  }

  getNodeType(builder: NodeBuilder): NodeType {
    const requestType = this.node.getNodeType(builder);

    let convertTo = null;
    for (const overloadingType of this.convertTo.split('|')) {
      if (convertTo === null || builder.getTypeLength(requestType) === builder.getTypeLength(overloadingType)) {
        convertTo = overloadingType;
      }
    }

    return convertTo as NodeType;
  }

  generate(builder: NodeBuilder, output?: NodeType) {
    const type = this.getNodeType(builder);

    return builder.format(this.node.build(builder, type), type, output);
  }
}
