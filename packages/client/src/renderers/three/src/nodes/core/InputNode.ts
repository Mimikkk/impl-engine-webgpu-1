import { Node } from './Node.js';

import { getValueType } from './NodeUtils.js';
import { NodeBuilder, NodeType } from '../Nodes.js';

class InputNode extends Node {
  constructor(value: any, nodeType = null) {
    super(nodeType);

    this.isInputNode = true;

    this.value = value;
    this.precision = null;
  }

  getNodeType(builder: NodeBuilder) {
    if (this.nodeType === null) {
      return getValueType(this.value);
    }

    return this.nodeType;
  }

  getInputType(builder: NodeBuilder) {
    return this.getNodeType(builder);
  }

  setPrecision(precision) {
    this.precision = precision;

    return this;
  }

  generate(builder: NodeBuilder, output: NodeType) {
    console.warn('Abstract function.');
  }
}

export default InputNode;
