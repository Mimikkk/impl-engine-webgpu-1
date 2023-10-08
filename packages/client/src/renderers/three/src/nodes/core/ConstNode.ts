import { InputNode } from './InputNode.js';
import { NodeBuilder } from './NodeBuilder.js';
import { NodeType } from './constants.js';

export class ConstNode extends InputNode {
  constructor(value: any, nodeType = null) {
    super(value, nodeType);
  }

  generateConst(builder: NodeBuilder) {
    return builder.getConst(this.getNodeType(builder), this.value);
  }

  generate(builder: NodeBuilder, output?: NodeType) {
    const type = this.getNodeType(builder);

    return builder.format(this.generateConst(builder), type, output);
  }
}
