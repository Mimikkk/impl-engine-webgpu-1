import { Node } from '../core/Node.js';
import { uv, UVNode } from '../accessors/UVNode.js';
import { float, nodeProxy, vec2 } from '../shadernode/ShaderNode.js';
import { NodeType } from '../core/constants.js';

export class SpriteSheetUVNode extends Node {
  countNode: Node;
  uvNode: UVNode;
  frameNode: Node;

  constructor(countNode: Node, uvNode: UVNode = uv(), frameNode: Node = float(0)) {
    super(NodeType.Vector2);

    this.countNode = countNode;
    this.uvNode = uvNode;
    this.frameNode = frameNode;
  }

  construct() {
    const { frameNode, uvNode, countNode } = this;

    const { width, height } = countNode;

    const frameNum = frameNode.mod(width.mul(height)).floor();

    const column = frameNum.mod(width);
    const row = height.sub(frameNum.add(1).div(width).ceil());

    const scale = countNode.reciprocal();
    const uvFrameOffset = vec2(column, row);

    return uvNode.add(uvFrameOffset).mul(scale);
  }
}

export const spritesheetUV = nodeProxy(SpriteSheetUVNode);
