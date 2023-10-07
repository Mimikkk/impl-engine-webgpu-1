import { Node } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

export class RemapNode extends Node {
  node: Node;
  inLowNode: Node;
  inHighNode: Node;
  outLowNode: Node;
  outHighNode: Node;
  shouldClamp: boolean;

  constructor(node: Node, inLowNode: Node, inHighNode: Node, outLowNode: Node, outHighNode: Node) {
    super();

    this.node = node;
    this.inLowNode = inLowNode;
    this.inHighNode = inHighNode;
    this.outLowNode = outLowNode;
    this.outHighNode = outHighNode;

    this.shouldClamp = true;
  }

  construct() {
    const { node, inLowNode, inHighNode, outLowNode, outHighNode, shouldClamp } = this;

    let t = node.sub(inLowNode).div(inHighNode.sub(inLowNode));

    if (shouldClamp) t = t.clamp();
    return t.mul(outHighNode.sub(outLowNode)).add(outLowNode);
  }
}

export const remap = nodeProxy(RemapNode, null, null, { doClamp: false });
export const remapClamp = nodeProxy(RemapNode);

addNodeElement('remap', remap);
addNodeElement('remapClamp', remapClamp);
