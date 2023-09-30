import { Node } from '../core/Node.js';
import { attribute } from '../core/AttributeNode.js';
import { temp } from '../core/VarNode.js';
import { varying } from '../core/VaryingNode.js';
import { normalize } from '../math/MathNode.js';
import { CameraNodes } from './CameraNode.js';
import { ModelNodes } from './ModelNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

export class TangentNode extends Node {
  scope: TangentNode.Scope;

  constructor(scope: TangentNode.Scope) {
    super();
    this.scope = scope;
  }

  getHash() {
    return `tangent-${this.scope}`;
  }

  getNodeType() {
    switch (this.scope) {
      case TangentNode.Scope.Geometry:
        return 'vec4';
      case TangentNode.Scope.Local:
      case TangentNode.Scope.View:
      case TangentNode.Scope.World:
        return 'vec3';
    }
  }

  fromScope() {
    switch (this.scope) {
      case TangentNode.Scope.Geometry:
        return attribute('tangent', NodeType.Vector4);
      case TangentNode.Scope.Local:
        return varying(TangentNodes.geometry.xyz);
      case TangentNode.Scope.View:
        return normalize(varying(ModelNodes.viewMatrix.mul(TangentNodes.local).xyz));
      case TangentNode.Scope.World:
        return normalize(varying(TangentNodes.view.transformDirection(CameraNodes.matrix.view)));
    }
  }

  generate(builder: NodeBuilder) {
    return this.fromScope().build(builder, this.getNodeType());
  }
}

export namespace TangentNode {
  export enum Scope {
    Geometry = 'geometry',
    Local = 'local',
    View = 'view',
    World = 'world',
  }
}

export namespace TangentNodes {
  export const geometry = nodeImmutable(TangentNode, TangentNode.Scope.Geometry);
  export const local = nodeImmutable(TangentNode, TangentNode.Scope.Local);
  export const view = nodeImmutable(TangentNode, TangentNode.Scope.View);
  export const world = nodeImmutable(TangentNode, TangentNode.Scope.World);

  export namespace transformed {
    export const view = temp(TangentNodes.view, 'TransformedTangentView');
    export const world = normalize(transformed.view.transformDirection(CameraNodes.matrix.view));
  }
}
