import { Node } from '../core/Node.js';
import { CameraNodes } from './CameraNode.js';
import { NormalNodes } from './NormalNode.js';
import { PositionNodes } from './PositionNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeType } from '../core/constants.js';

export class ReflectVectorNode extends Node {
  constructor() {
    super(NodeType.Vector3);
  }

  getHash() {
    return 'reflectVector';
  }

  construct() {
    const reflectView = PositionNodes.directional.view.negate().reflect(NormalNodes.transformed.view);

    return reflectView.transformDirection(CameraNodes.matrix.view);
  }
}

export const reflectVector = nodeImmutable(ReflectVectorNode);
