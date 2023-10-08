import { Node } from './Node.js';

export class NodeAttribute {
  name: string;
  type: string;
  node: Node;

  constructor(name: string, type: string, node: Node) {
    this.name = name;
    this.type = type;
    this.node = node;
  }
}
