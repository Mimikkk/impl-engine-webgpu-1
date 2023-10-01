import { Node } from '../core/Node.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { Object3DNodes } from '../accessors/Object3DNode.js';
import { CameraNodes } from '../accessors/CameraNode.js';
import { Light } from '../../lights/Light.js';

export class LightNode extends Node {
  scope: string;
  light: Light;

  constructor(scope: LightNode.Scope, light: Light) {
    super();

    this.scope = scope;
    this.light = light;
  }

  construct() {
    switch (this.scope) {
      case LightNode.Scope.TargetDirection:
        return CameraNodes.matrix.view.transformDirection(
          Object3DNodes.position(this.light).sub(Object3DNodes.position(this.light.target)),
        );
    }
  }
}

export namespace LightNode {
  export enum Scope {
    TargetDirection = 'targetDirection',
  }
}

export namespace LightNodes {
  export const targetDirection = nodeProxy(LightNode, LightNode.Scope.TargetDirection);
}

export const lightTargetDirection = LightNodes.targetDirection;
