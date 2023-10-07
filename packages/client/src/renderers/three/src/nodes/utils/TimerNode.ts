import UniformNode from '../core/UniformNode.js';
import { NodeType, NodeUpdateType } from '../core/constants.js';
import { nodeImmutable, nodeObject } from '../shadernode/ShaderNode.js';
import { NodeFrame } from '../core/NodeFrame.js';

export class TimerNode extends UniformNode {
  scope: TimerNode.Scope;
  scale: number;

  constructor(scope: TimerNode.Scope, scale: number = 1, value: number = 0) {
    super(value);

    this.scope = scope;
    this.scale = scale;
    this.updateType = NodeUpdateType.Frame;
  }

  getNodeType() {
    switch (this.scope) {
      case TimerNode.Scope.GLOBAL:
      case TimerNode.Scope.DELTA:
      case TimerNode.Scope.LOCAL:
        return NodeType.Float;
      case TimerNode.Scope.FRAME:
        return NodeType.UnsignedInteger;
    }
  }
  update(frame: NodeFrame) {
    switch (this.scope) {
      case TimerNode.Scope.GLOBAL:
        this.value = frame.time * this.scale;
        break;
      case TimerNode.Scope.DELTA:
        this.value = frame.deltaTime * this.scale;
        break;
      case TimerNode.Scope.LOCAL:
        this.value += frame.deltaTime * this.scale;
        break;
      case TimerNode.Scope.FRAME:
        this.value = frame.frameId;
        break;
    }
  }
}

export namespace TimerNode {
  export enum Scope {
    LOCAL = 'local',
    GLOBAL = 'global',
    DELTA = 'delta',
    FRAME = 'frame',
  }
}

export namespace TimerNodes {
  export const local = (timeScale: number = 1, value: number = 0) =>
    nodeObject(new TimerNode(TimerNode.Scope.LOCAL, timeScale, value));
  export const global = (timeScale: number = 1, value: number = 0) =>
    nodeObject(new TimerNode(TimerNode.Scope.GLOBAL, timeScale, value));
  export const delta = (timeScale: number = 1, value: number = 0) =>
    nodeObject(new TimerNode(TimerNode.Scope.DELTA, timeScale, value));
  export const frame = nodeImmutable(TimerNode, TimerNode.Scope.FRAME);
}
