import { Node } from '../core/Node.js';
import { CameraNodes } from './CameraNode.js';
import { modelViewMatrix } from './ModelNode.js';
import PositionNode, { positionLocal } from './PositionNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

export class ModelViewProjectionNode extends Node {
  positionNode: PositionNode;

  constructor(positionNode: PositionNode = positionLocal) {
    super('vec4');

    this.positionNode = positionNode;
  }

  construct() {
    return CameraNodes.matrix.projection.mul(modelViewMatrix).mul(this.positionNode);
  }
}

export const modelViewProjection = nodeProxy(ModelViewProjectionNode);
