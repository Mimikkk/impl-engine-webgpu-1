import { TempNode } from '../core/TempNode.js';
import { NormalNodes } from '../accessors/NormalNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { nodeImmutable, vec2, vec3 } from '../shadernode/ShaderNode.js';
import { NodeType } from '../core/constants.js';

export class MatcapUVNode extends TempNode {
  constructor() {
    super(NodeType.Vector2);
  }

  construct() {
    const x = vec3(PositionNodes.directional.view.z, 0, PositionNodes.directional.view.x.negate()).normalize();
    const y = PositionNodes.directional.view.cross(x);

    return vec2(x.dot(NormalNodes.transformed.view), y.dot(NormalNodes.transformed.view)).mul(0.495).add(0.5);
  }
}

export const matcapUV = nodeImmutable(MatcapUVNode);
