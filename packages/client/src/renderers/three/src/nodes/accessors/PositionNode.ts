import { Node } from '../core/Node.js';
import { attribute } from '../core/AttributeNode.js';
import { varying } from '../core/VaryingNode.js';
import { normalize } from '../math/MathNode.js';
import { ModelNodes } from './ModelNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import NodeBuilder from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

export class PositionNode extends Node {
  scope: PositionNode.Scope;

  constructor(scope: PositionNode.Scope) {
    super(NodeType.Vector3);
    this.scope = scope;
  }

  isGlobal() {
    return true;
  }

  getHash() {
    return `position-${this.scope}`;
  }

  fromScope() {
    switch (this.scope) {
      case PositionNode.Scope.Geometry:
        return attribute('position', NodeType.Vector3);
      case PositionNode.Scope.Local:
        return varying(PositionNodes.geometry);
      case PositionNode.Scope.World:
        return varying(ModelNodes.worldMatrix.mul(PositionNodes.local));
      case PositionNode.Scope.View:
        return varying(ModelNodes.viewMatrix.mul(PositionNodes.local));
      case PositionNode.Scope.ViewDirection:
        return normalize(varying(PositionNodes.view.negate()));
      case PositionNode.Scope.WorldDirection:
        return normalize(varying(PositionNodes.local.transformDirection(ModelNodes.worldMatrix)));
      default:
        throw Error(`PositionNode: Invalid scope ${this.scope}`);
    }
  }

  generate(builder: NodeBuilder) {
    return this.fromScope().build(builder, this.getNodeType(builder));
  }
}

export namespace PositionNode {
  export enum Scope {
    Geometry = 'geometry',
    World = 'world',
    Local = 'local',
    View = 'view',
    ViewDirection = 'viewDirection',
    WorldDirection = 'worldDirection',
  }
}
export namespace PositionNodes {
  export const geometry = nodeImmutable(PositionNode, PositionNode.Scope.Geometry);
  export const local = nodeImmutable(PositionNode, PositionNode.Scope.Local);
  export const world = nodeImmutable(PositionNode, PositionNode.Scope.World);
  export const view = nodeImmutable(PositionNode, PositionNode.Scope.View);

  export namespace directional {
    export const world = nodeImmutable(PositionNode, PositionNode.Scope.WorldDirection);
    export const view = nodeImmutable(PositionNode, PositionNode.Scope.ViewDirection);
  }
}
