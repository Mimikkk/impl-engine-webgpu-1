import { Node } from '../core/Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeType } from '../core/constants.js';

export class PointUVNode extends Node {
  constructor() {
    super(NodeType.Vector2);
  }

  generate() {
    return 'vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y)';
  }
}

export const pointUV = nodeImmutable(PointUVNode);
