import { Node } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform, UniformNode } from '../core/UniformNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

import { Object3D, Vector3 } from '../../Three.js';
import NodeBuilder from '../core/NodeBuilder.js';
import NodeFrame from '../core/NodeFrame.js';

export class Object3DNode extends Node {
  scope: Object3DNode.Scope;
  object3d: Object3D | null;
  _uniformNode: UniformNode;

  constructor(scope: Object3DNode.Scope = Object3DNode.Scope.ViewMatrix, object3d: Object3D) {
    super();

    this.scope = scope;
    this.object3d = object3d;

    this.updateType = NodeUpdateType.Object;

    this._uniformNode = uniform(null, undefined) as any;
  }

  getNodeType() {
    switch (this.scope) {
      case Object3DNode.Scope.WorldMatrix:
      case Object3DNode.Scope.ViewMatrix:
        return 'mat4';
      case Object3DNode.Scope.NormalMatrix:
        return 'mat3';
      case Object3DNode.Scope.Position:
      case Object3DNode.Scope.ViewPosition:
      case Object3DNode.Scope.Direction:
      case Object3DNode.Scope.Scale:
        return 'vec3';
    }
  }

  update(frame: NodeFrame) {
    const object = this.object3d!;
    const uniformNode = this._uniformNode;
    const scope = this.scope;

    if (scope === Object3DNode.Scope.ViewMatrix) {
      uniformNode.value = object.modelViewMatrix;
    } else if (scope === Object3DNode.Scope.NormalMatrix) {
      uniformNode.value = object.normalMatrix;
    } else if (scope === Object3DNode.Scope.WorldMatrix) {
      uniformNode.value = object.matrixWorld;
    } else if (scope === Object3DNode.Scope.Position) {
      uniformNode.value = uniformNode.value || new Vector3();

      uniformNode.value.setFromMatrixPosition(object.matrixWorld);
    } else if (scope === Object3DNode.Scope.Scale) {
      uniformNode.value = uniformNode.value || new Vector3();

      uniformNode.value.setFromMatrixScale(object.matrixWorld);
    } else if (scope === Object3DNode.Scope.Direction) {
      uniformNode.value = uniformNode.value || new Vector3();

      object.getWorldDirection(uniformNode.value);
    } else if (scope === Object3DNode.Scope.ViewPosition) {
      const camera = frame.camera;

      uniformNode.value = uniformNode.value || new Vector3();
      uniformNode.value.setFromMatrixPosition(object.matrixWorld);

      uniformNode.value.applyMatrix4(camera!.matrixWorldInverse);
    }
  }

  generate(builder: NodeBuilder) {
    const scope = this.scope;

    if (scope === Object3DNode.Scope.WorldMatrix || scope === Object3DNode.Scope.ViewMatrix) {
      this._uniformNode.nodeType = 'mat4';
    } else if (scope === Object3DNode.Scope.NormalMatrix) {
      this._uniformNode.nodeType = 'mat3';
    } else if (
      scope === Object3DNode.Scope.Position ||
      scope === Object3DNode.Scope.ViewPosition ||
      scope === Object3DNode.Scope.Direction ||
      scope === Object3DNode.Scope.Scale
    ) {
      this._uniformNode.nodeType = 'vec3';
    }

    return this._uniformNode.build(builder);
  }
}

export namespace Object3DNode {
  export enum Scope {
    ViewMatrix = 'viewMatrix',
    NormalMatrix = 'normalMatrix',
    WorldMatrix = 'worldMatrix',
    Position = 'position',
    Scale = 'scale',
    ViewPosition = 'viewPosition',
    Direction = 'direction',
  }
}

export namespace Object3DNodes {
  export const direction = nodeProxy(Object3DNode, Object3DNode.Scope.Direction);
  export const position = nodeProxy(Object3DNode, Object3DNode.Scope.Position);
  export const viewPosition = nodeProxy(Object3DNode, Object3DNode.Scope.ViewPosition);
  export const scale = nodeProxy(Object3DNode, Object3DNode.Scope.Scale);
  export const viewMatrix = nodeProxy(Object3DNode, Object3DNode.Scope.ViewMatrix);
  export const normalMatrix = nodeProxy(Object3DNode, Object3DNode.Scope.NormalMatrix);
  export const worldMatrix = nodeProxy(Object3DNode, Object3DNode.Scope.WorldMatrix);
}
