import { Node } from '../core/Node.js';
import { float, nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

export class FrontFacingNode extends Node {
  isFrontFacingNode: boolean;

  constructor() {
    super(NodeType.Boolean);
    this.isFrontFacingNode = true;
  }

  generate(builder: NodeBuilder) {
    return builder.getFrontFacing();
  }
}

export const frontFacing = nodeImmutable(FrontFacingNode);
export const faceDirection = float(frontFacing).mul(2.0).sub(1.0);
