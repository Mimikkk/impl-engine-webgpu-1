import { Node } from '../core/Node.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { Object3DNodes } from '../accessors/Object3DNode.js';
import { CameraNodes } from '../accessors/CameraNode.js';

export class LightNode extends Node {
  constructor(scope = LightNode.TARGET_DIRECTION, light = null) {
    super();

    this.scope = scope;
    this.light = light;
  }

  construct() {
    const { scope, light } = this;

    let output = null;

    if (scope === LightNode.TARGET_DIRECTION) {
      output = CameraNodes.matrix.view.transformDirection(
        Object3DNodes.position(light).sub(Object3DNodes.position(light.target)),
      );
    }

    return output;
  }
}

LightNode.TARGET_DIRECTION = 'targetDirection';

export const lightTargetDirection = nodeProxy(LightNode, LightNode.TARGET_DIRECTION);
