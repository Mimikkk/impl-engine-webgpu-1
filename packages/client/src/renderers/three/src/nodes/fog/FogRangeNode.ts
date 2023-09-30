import { FogNode } from './FogNode.js';
import { smoothstep } from '../math/MathNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { Node } from '../core/Node.js';

export class FogRangeNode extends FogNode {
  nearNode: Node;
  farNode: Node;

  constructor(colorNode: Node, nearNode: Node, farNode: Node) {
    super(colorNode);

    this.nearNode = nearNode;
    this.farNode = farNode;
  }

  construct() {
    return smoothstep(this.nearNode, this.farNode, PositionNodes.view.z.negate());
  }
}

export const rangeFog = nodeProxy(FogRangeNode);
