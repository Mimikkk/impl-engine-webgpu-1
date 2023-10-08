import { Node } from './Node.js';

let id = 0;

export class NodeCache {
  id: number;
  nodesData: WeakMap<any, any>;

  constructor() {
    this.id = id++;
    this.nodesData = new WeakMap();
  }

  getNodeData(node: Node) {
    return this.nodesData.get(node);
  }

  setNodeData(node: Node, data: Node) {
    this.nodesData.set(node, data);
  }
}
