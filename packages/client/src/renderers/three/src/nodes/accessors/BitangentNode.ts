import { Node } from '../core/Node.js';
import { varying } from '../core/VaryingNode.js';
import { normalize } from '../math/MathNode.js';
import { CameraNodes } from './CameraNode.js';
import { NormalNodes } from './NormalNode.js';
import { TangentNodes } from './TangentNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

export class BitangentNode extends Node {
  scope: BitangentNode.Scope;

  constructor(scope: BitangentNode.Scope = BitangentNode.Scope.Local) {
    super(NodeType.Vector3);

    this.scope = scope;
  }

  getHash() {
    return `bitangent-${this.scope}`;
  }

  fromScope() {
    switch (this.scope) {
      case BitangentNode.Scope.Geometry:
        return NormalNodes.geometry.cross(TangentNodes.geometry);
      case BitangentNode.Scope.Local:
        return NormalNodes.local.cross(TangentNodes.local);
      case BitangentNode.Scope.View:
        return NormalNodes.view.cross(TangentNodes.view);
      case BitangentNode.Scope.World:
        return NormalNodes.world.cross(TangentNodes.world);
    }
  }

  generate(builder: NodeBuilder) {
    const vertexNode = this.fromScope().mul(TangentNodes.geometry.w).xyz;

    return normalize(varying(vertexNode)).build(builder, this.getNodeType(builder));
  }
}

export namespace BitangentNode {
  export enum Scope {
    Geometry = 'geometry',
    Local = 'local',
    View = 'view',
    World = 'world',
  }
}

export namespace BitangentNodes {
  export const geometry = nodeImmutable(BitangentNode, BitangentNode.Scope.Geometry);
  export const local = nodeImmutable(BitangentNode, BitangentNode.Scope.Local);
  export const view = nodeImmutable(BitangentNode, BitangentNode.Scope.View);
  export const world = nodeImmutable(BitangentNode, BitangentNode.Scope.World);

  export namespace transformed {
    export const view = normalize(
      NormalNodes.transformed.view.cross(TangentNodes.transformed.view).mul(TangentNodes.geometry.w),
    );
    export const world = normalize(view.transformDirection(CameraNodes.matrix.view));
  }
}
