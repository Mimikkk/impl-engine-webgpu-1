import { Node } from '../core/Node.js';
import { float, nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

export class FrontFacingNode extends Node {
  isFrontFacingNode: boolean;

  constructor() {
    super('bool');
    this.isFrontFacingNode = true;
  }

  generate(builder: NodeBuilder) {
    return builder.getFrontFacing();
  }
}

export default FrontFacingNode;

export const frontFacing = nodeImmutable(FrontFacingNode);
export const faceDirection = float(frontFacing).mul(2.0).sub(1.0);
