import { Node } from '../core/Node.js';
import { CameraNodes } from './CameraNode.js';
import { transformedNormalView } from './NormalNode.js';
import { positionViewDirection } from './PositionNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

class ReflectVectorNode extends Node {
  constructor() {
    super('vec3');
  }

  getHash(builder: NodeBuilder) {
    return 'reflectVector';
  }

  construct() {
    const reflectView = positionViewDirection.negate().reflect(transformedNormalView);

    return reflectView.transformDirection(CameraNodes.matrix.view);
  }
}

export default ReflectVectorNode;

export const reflectVector = nodeImmutable(ReflectVectorNode);
