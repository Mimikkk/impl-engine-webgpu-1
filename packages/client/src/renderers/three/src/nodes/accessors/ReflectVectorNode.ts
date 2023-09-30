import { Node } from '../core/Node.js';
import { CameraNodes } from './CameraNode.js';
import { NormalNodes } from './NormalNode.js';
import { PositionNodes } from './PositionNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

class ReflectVectorNode extends Node {
  constructor() {
    super(NodeType.Vector3);
  }

  getHash(builder: NodeBuilder) {
    return 'reflectVector';
  }

  construct() {
    const reflectView = PositionNodes.directional.view.negate().reflect(NormalNodes.transformed.view);

    return reflectView.transformDirection(CameraNodes.matrix.view);
  }
}

export default ReflectVectorNode;

export const reflectVector = nodeImmutable(ReflectVectorNode);
