import { Node } from '../core/Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeType } from '../core/constants.js';

class PointUVNode extends Node {
  isPointUVNode: boolean = true;

  constructor() {
    super(NodeType.Vector2);
  }

  generate() {
    return 'vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y)';
  }
}

export default PointUVNode;

export const pointUV = nodeImmutable(PointUVNode);
