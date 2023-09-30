import { Node } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform, UniformNode } from '../core/UniformNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

import { Object3D, Vector3 } from '../../Three.js';
import NodeBuilder from '../core/NodeBuilder.js';
import { NodeFrame } from '../core/NodeFrame.js';

export class Object3DNode extends Node {
  scope: Object3DNode.Scope;
  object3d: Object3D | null;
  uniformNode: UniformNode;

  constructor(scope: Object3DNode.Scope = Object3DNode.Scope.ViewMatrix, object3d: Object3D | null = null) {
    super();

    this.scope = scope;
    this.object3d = object3d;

    this.updateType = NodeUpdateType.Object;

    this.uniformNode = uniform(null, undefined) as any;
  }

  getNodeType(): string {
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
    const uniformNode = this.uniformNode;

    switch (this.scope) {
      case Object3DNode.Scope.WorldMatrix:
        uniformNode.value = object.matrixWorld;
        break;
      case Object3DNode.Scope.ViewMatrix:
        uniformNode.value = object.modelViewMatrix;
        break;
      case Object3DNode.Scope.NormalMatrix:
        uniformNode.value = object.normalMatrix;
        break;
      case Object3DNode.Scope.Position:
        uniformNode.value ??= new Vector3();
        uniformNode.value.setFromMatrixPosition(object.matrixWorld);
        break;
      case Object3DNode.Scope.Scale:
        uniformNode.value ??= new Vector3();
        uniformNode.value.setFromMatrixScale(object.matrixWorld);
        break;
      case Object3DNode.Scope.Direction:
        uniformNode.value ??= new Vector3();
        object.getWorldDirection(uniformNode.value);
        break;
      case Object3DNode.Scope.ViewPosition:
        uniformNode.value ??= new Vector3();
        uniformNode.value.setFromMatrixPosition(object.matrixWorld);
        uniformNode.value.applyMatrix4(frame.camera!.matrixWorldInverse);
        break;
    }
  }

  generate(builder: NodeBuilder) {
    this.uniformNode.nodeType = this.getNodeType();
    return this.uniformNode.build(builder);
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
