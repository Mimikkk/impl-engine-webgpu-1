import { UniformNode } from './UniformNode.js';
import { NodeBuilder } from '../Nodes.js';

export class ArrayUniformNode extends UniformNode {
  nodes: UniformNode[];
  isArrayUniformNode: boolean;

  constructor(nodes: UniformNode[] = []) {
    super();

    this.isArrayUniformNode = true;

    this.nodes = nodes;
  }

  getNodeType(builder: NodeBuilder) {
    return this.nodes[0].getNodeType(builder);
  }
}
