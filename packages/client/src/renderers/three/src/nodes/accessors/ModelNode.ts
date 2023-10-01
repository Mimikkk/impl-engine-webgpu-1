import { Object3DNode } from './Object3DNode.js';
import { label } from '../core/ContextNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeFrame } from '../core/NodeFrame.js';

export class ModelNode extends Object3DNode {
  constructor(scope: Object3DNode.Scope = ModelNode.Scope.ViewMatrix) {
    super(scope);
  }

  update(frame: NodeFrame) {
    this.object3d = frame.object;
    super.update(frame);
  }
}

export namespace ModelNodes {
  export const direction = nodeImmutable(ModelNode, Object3DNode.Scope.Direction);

  export const viewPosition = nodeImmutable(ModelNode, Object3DNode.Scope.ViewPosition);
  export const viewMatrix = label(nodeImmutable(ModelNode, Object3DNode.Scope.ViewMatrix), 'modelViewMatrix');
  export const worldMatrix = nodeImmutable(ModelNode, Object3DNode.Scope.WorldMatrix);
  export const normalMatrix = nodeImmutable(ModelNode, Object3DNode.Scope.NormalMatrix);

  export const position = nodeImmutable(ModelNode, Object3DNode.Scope.Position);
  export const scale = nodeImmutable(ModelNode, Object3DNode.Scope.Scale);
}
