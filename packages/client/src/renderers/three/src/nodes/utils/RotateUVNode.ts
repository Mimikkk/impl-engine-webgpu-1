import { TempNode } from '../core/TempNode.js';
import { addNodeElement, nodeProxy, vec2 } from '../shadernode/ShaderNode.js';
import { UVNode } from '../accessors/UVNode.js';
import { Node } from '../core/Node.js';
import { NodeType } from '../core/constants.js';

export class RotateUVNode extends TempNode {
  uvNode: UVNode;
  rotationNode: Node;
  centerNode: Node;

  constructor(uvNode: UVNode, rotationNode: Node, centerNode: Node = vec2(0.5)) {
    super(NodeType.Vector2);

    this.uvNode = uvNode;
    this.rotationNode = rotationNode;
    this.centerNode = centerNode;
  }

  construct() {
    const { uvNode, rotationNode, centerNode } = this;

    const cosAngle = rotationNode.cos();
    const sinAngle = rotationNode.sin();
    const vector = uvNode.sub(centerNode);

    const rotatedVector = vec2(vec2(cosAngle, sinAngle).dot(vector), vec2(sinAngle.negate(), cosAngle).dot(vector));

    return rotatedVector.add(centerNode);
  }
}

export const rotateUV = nodeProxy(RotateUVNode);

addNodeElement('rotateUV', rotateUV);
