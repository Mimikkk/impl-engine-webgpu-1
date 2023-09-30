import { Object3DNode } from './Object3DNode.js';
import { label } from '../core/ContextNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeFrame } from '../core/NodeFrame.js';

export class CameraNode extends Object3DNode {
  //@ts-expect-error
  declare scope: Object3DNode.Scope | CameraNode.Scope;

  constructor(scope: CameraNode.Scope | Object3DNode.Scope = Object3DNode.Scope.Position) {
    super(scope as never);
  }

  getNodeType() {
    switch (this.scope) {
      case CameraNode.Scope.ProjectionMatrix:
        return 'mat4';
      case CameraNode.Scope.Near:
      case CameraNode.Scope.Far:
        return 'float';
      default:
        return super.getNodeType();
    }
  }

  update(frame: NodeFrame) {
    const camera = frame.camera as any;

    switch (this.scope) {
      case Object3DNode.Scope.ViewMatrix:
        this.uniformNode.value = camera.matrixWorldInverse;
        break;
      case CameraNode.Scope.ProjectionMatrix:
        this.uniformNode.value = camera.projectionMatrix;
        break;
      case CameraNode.Scope.Near:
        this.uniformNode.value = camera.near;
        break;
      case CameraNode.Scope.Far:
        this.uniformNode.value = camera.far;
        break;
      default:
        this.object3d = camera;
        super.update(frame);
    }
  }

  generate(builder: NodeBuilder) {
    this.uniformNode.nodeType = this.getNodeType();
    return super.generate(builder);
  }
}

export namespace CameraNode {
  export enum Scope {
    ProjectionMatrix = 'projectionMatrix',
    Near = 'near',
    Far = 'far',
  }
}

export namespace CameraNodes {
  const { Near, Far, ProjectionMatrix } = CameraNode.Scope;
  const { Position, ViewMatrix, WorldMatrix, NormalMatrix } = Object3DNode.Scope;

  export namespace matrix {
    export const projection = label(nodeImmutable(CameraNode, ProjectionMatrix), ProjectionMatrix);
    export const normal = nodeImmutable(CameraNode, NormalMatrix);
    export const view = nodeImmutable(CameraNode, ViewMatrix);
    export const world = nodeImmutable(CameraNode, WorldMatrix);
  }

  export const position = nodeImmutable(CameraNode, Position);
  export const near = nodeImmutable(CameraNode, Near);
  export const far = nodeImmutable(CameraNode, Far);
}
