import { Node } from './Node.js';
import { NodeType } from './constants.js';

export class NodeUniform {
  isNodeUniform = true;
  name: string;
  type: string;
  node: Node;
  needsUpdate: boolean;

  constructor(name: string, type: NodeType, node: Node, needsUpdate: boolean = false) {
    this.isNodeUniform = true;

    this.name = name;
    this.type = type;
    this.node = node;
    this.needsUpdate = needsUpdate;
  }

  get value() {
    return this.node.value;
  }

  set value(val) {
    this.node.value = val;
  }
}
