import { Node } from '../core/Node.js';
import { TimerNode, TimerNodes } from './TimerNode.js';
import { nodeObject, nodeProxy } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

export class OscNode extends Node {
  method: OscNode.Method;
  timeNode: TimerNode;

  constructor(method: OscNode.Method = OscNode.Method.Sine, timeNode: TimerNode = TimerNodes.local()) {
    super();

    this.method = method;
    this.timeNode = timeNode;
  }

  getNodeType(builder: NodeBuilder): NodeType {
    return this.timeNode.getNodeType(builder) as NodeType;
  }

  construct() {
    const timeNode = nodeObject(this.timeNode);

    switch (this.method) {
      case OscNode.Method.Sine:
        return timeNode
          .add(0.75)
          .mul(Math.PI * 2)
          .sin()
          .mul(0.5)
          .add(0.5);
      case OscNode.Method.Square:
        return timeNode.fract().round();
      case OscNode.Method.Triangle:
        return timeNode.add(0.5).fract().mul(2).sub(1).abs();
      case OscNode.Method.Saw:
        return timeNode.fract();
    }
  }
}
export namespace OscNode {
  export enum Method {
    Sine = 'sine',
    Square = 'square',
    Triangle = 'triangle',
    Saw = 'sawtooth',
  }
}
export namespace OscNodes {
  export const sine = nodeProxy(OscNode, OscNode.Method.Sine);
  export const square = nodeProxy(OscNode, OscNode.Method.Square);
  export const triangle = nodeProxy(OscNode, OscNode.Method.Triangle);
  export const saw = nodeProxy(OscNode, OscNode.Method.Saw);
}
