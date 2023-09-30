import { Node } from './Node.js';

import { getValueType } from './NodeUtils.js';
import { NodeBuilder, NodeType } from '../Nodes.js';

export class InputNode extends Node {
  isInputNode: boolean = true;
  value: any;
  precision: string | null;

  constructor(value: any, nodeType: NodeType | null = null) {
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

  setPrecision(precision: string) {
    this.precision = precision;

    return this;
  }

  generate(builder: NodeBuilder, output: NodeType) {
    console.warn('Abstract function.');
  }
}
