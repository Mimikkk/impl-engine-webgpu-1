import { Node } from '../core/Node.js';
import { attribute } from '../core/AttributeNode.js';
import { varying } from '../core/VaryingNode.js';
import { normalize } from '../math/MathNode.js';
import { ModelNodes } from './ModelNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import NodeBuilder from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

class PositionNode extends Node {
  constructor(scope = PositionNode.LOCAL) {
    super(NodeType.Vector3);

    this.scope = scope;
  }

  isGlobal() {
    return true;
  }

  getHash(builder: NodeBuilder) {
    return `position-${this.scope}`;
  }

  generate(builder: NodeBuilder) {
    const scope = this.scope;

    let outputNode = null;

    if (scope === PositionNode.GEOMETRY) {
      outputNode = attribute('position', 'vec3');
    } else if (scope === PositionNode.LOCAL) {
      outputNode = varying(positionGeometry);
    } else if (scope === PositionNode.WORLD) {
      const vertexPositionNode = ModelNodes.worldMatrix.mul(positionLocal);
      outputNode = varying(vertexPositionNode);
    } else if (scope === PositionNode.VIEW) {
      const vertexPositionNode = ModelNodes.viewMatrix.mul(positionLocal);
      outputNode = varying(vertexPositionNode);
    } else if (scope === PositionNode.VIEW_DIRECTION) {
      const vertexPositionNode = positionView.negate();
      outputNode = normalize(varying(vertexPositionNode));
    } else if (scope === PositionNode.WORLD_DIRECTION) {
      const vertexPositionNode = positionLocal.transformDirection(ModelNodes.worldMatrix);
      outputNode = normalize(varying(vertexPositionNode));
    }

    return outputNode.build(builder, this.getNodeType(builder));
  }
}

PositionNode.GEOMETRY = 'geometry';
PositionNode.LOCAL = 'local';
PositionNode.WORLD = 'world';
PositionNode.WORLD_DIRECTION = 'worldDirection';
PositionNode.VIEW = 'view';
PositionNode.VIEW_DIRECTION = 'viewDirection';

export default PositionNode;

export const positionGeometry = nodeImmutable(PositionNode, PositionNode.GEOMETRY);
export const positionLocal = nodeImmutable(PositionNode, PositionNode.LOCAL);
export const positionWorld = nodeImmutable(PositionNode, PositionNode.WORLD);
export const positionWorldDirection = nodeImmutable(PositionNode, PositionNode.WORLD_DIRECTION);
export const positionView = nodeImmutable(PositionNode, PositionNode.VIEW);
export const positionViewDirection = nodeImmutable(PositionNode, PositionNode.VIEW_DIRECTION);
