import { TempNode } from '../core/TempNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { nodeProxy, vec2 } from '../shadernode/ShaderNode.js';
import { NodeType } from '../core/constants.js';
import { Node } from '../core/Node.js';

export class EquirectUVNode extends TempNode {
  dirNode: Node;

  constructor(dirNode: Node = PositionNodes.directional.world) {
    super(NodeType.Vector2);

    this.dirNode = dirNode;
  }

  construct() {
    const dir = this.dirNode;

    const u = dir.z
      .atan2(dir.x)
      .mul(1 / (Math.PI * 2))
      .add(0.5);

    const v = dir.y
      .negate()
      .clamp(-1.0, 1.0)
      .asin()
      .mul(1 / Math.PI)
      .add(0.5); // @TODO: The use of negate() here could be an NDC issue.

    return vec2(u, v);
  }
}

export const equirectUV = nodeProxy(EquirectUVNode);
