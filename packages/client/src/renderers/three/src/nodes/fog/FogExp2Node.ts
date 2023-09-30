import { Node } from '../core/Node.js';
import { FogNode } from './FogNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

export class FogExp2Node extends FogNode {
  isFogExp2Node: boolean = true;
  densityNode: Node;

  constructor(colorNode: Node, densityNode: Node) {
    super(colorNode);

    this.isFogExp2Node = true;
    this.densityNode = densityNode;
  }

  construct() {
    const depthNode = PositionNodes.view.z.negate();
    const densityNode = this.densityNode;

    return densityNode.mul(densityNode, depthNode, depthNode).negate().exp().oneMinus();
  }
}

export default FogExp2Node;

export const densityFog = nodeProxy(FogExp2Node);

addNodeElement('densityFog', densityFog);
