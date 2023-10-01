import { Node } from '../core/Node.js';
import { NodeType } from '../core/constants.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

export class LightingNode extends Node {
  constructor() {
    super(NodeType.Vector3);
  }

  generate(builder: NodeBuilder) {
    console.warn('Abstract function.');
    return '';
  }
}
