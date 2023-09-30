import { Node } from '../core/Node.js';
import { attribute } from '../core/AttributeNode.js';
import { varying } from '../core/VaryingNode.js';
import { property } from '../core/PropertyNode.js';
import { normalize } from '../math/MathNode.js';
import { CameraNodes } from './CameraNode.js';
import { ModelNodes } from './ModelNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

import { NodeType } from '../core/constants.js';

export class NormalNode extends Node {
  scope: NormalNode.Scope;

  constructor(scope = NormalNode.Scope.Local) {
    super(NodeType.Vector3);

    this.scope = scope;
  }

  isGlobal() {
    return true;
  }

  getHash(builder: NodeBuilder) {
    return `normal-${this.scope}`;
  }

  fromScope() {
    switch (this.scope) {
      case NormalNode.Scope.Geometry:
        return attribute('normal', NodeType.Vector3);
      case NormalNode.Scope.Local:
        return varying(NormalNodes.geometry);
      case NormalNode.Scope.View:
        return normalize(varying(ModelNodes.normalMatrix.mul(NormalNodes.local)));
      case NormalNode.Scope.World:
        return normalize(varying(NormalNodes.view.transformDirection(CameraNodes.matrix.view)));
      default:
        throw Error(`NormalNode: Invalid scope ${this.scope}`);
    }
  }

  generate(builder: NodeBuilder) {
    return this.fromScope().build(builder, this.getNodeType(builder));
  }
}

export namespace NormalNode {
  export enum Scope {
    Geometry = 'geometry',
    Local = 'local',
    View = 'view',
    World = 'world',
  }
}

export namespace NormalNodes {
  export const geometry = nodeImmutable(NormalNode, NormalNode.Scope.Geometry);
  export const local = nodeImmutable(NormalNode, NormalNode.Scope.Local);
  export const view = nodeImmutable(NormalNode, NormalNode.Scope.View);
  export const world = nodeImmutable(NormalNode, NormalNode.Scope.World);

  export namespace transformed {
    export const view = property(NodeType.Vector3, 'TransformedNormalView');
    export const world = view.transformDirection(CameraNodes.matrix.view).normalize();
    export const clearcoat = property(NodeType.Vector3, 'TransformedClearcoatNormalView');
  }
}
