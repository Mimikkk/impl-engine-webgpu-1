import { FogNode } from './FogNode.js';
import { smoothstep } from '../math/MathNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { Node } from '../core/Node.js';

export class FogRangeNode extends FogNode {
  isFogRangeNode: boolean = true;
  nearNode: Node;
  farNode: Node;

  constructor(colorNode: Node, nearNode: Node, farNode: Node) {
    super(colorNode);

    this.isFogRangeNode = true;

    this.nearNode = nearNode;
    this.farNode = farNode;
  }

  construct(): Node | null {
    return smoothstep(this.nearNode, this.farNode, PositionNodes.view.z.negate());
  }
}

export default FogRangeNode;

export const rangeFog = nodeProxy(FogRangeNode);

addNodeElement('rangeFog', rangeFog);
