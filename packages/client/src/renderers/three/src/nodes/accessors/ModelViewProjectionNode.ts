import { Node } from '../core/Node.js';
import { CameraNodes } from './CameraNode.js';
import { ModelNodes } from './ModelNode.js';
import PositionNode, { positionLocal } from './PositionNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { NodeType } from '../core/constants.js';

export class ModelViewProjectionNode extends Node {
  positionNode: PositionNode;

  constructor(positionNode: PositionNode = positionLocal) {
    super(NodeType.Vector4);
    this.positionNode = positionNode;
  }

  construct() {
    return CameraNodes.matrix.projection.mul(ModelNodes.viewMatrix).mul(this.positionNode);
  }
}

export const modelViewProjection = nodeProxy(ModelViewProjectionNode);
