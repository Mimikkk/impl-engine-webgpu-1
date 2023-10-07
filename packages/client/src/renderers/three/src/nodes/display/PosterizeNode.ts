import { TempNode } from '../core/TempNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { Node } from '../core/Node.js';

export class PosterizeNode extends TempNode {
  sourceNode: Node;
  stepsNode: Node;

  constructor(sourceNode: Node, stepsNode: Node) {
    super();

    this.sourceNode = sourceNode;
    this.stepsNode = stepsNode;
  }

  construct() {
    const { sourceNode, stepsNode } = this;

    return sourceNode.mul(stepsNode).floor().div(stepsNode);
  }
}

export const posterize = nodeProxy(PosterizeNode);

addNodeElement('posterize', posterize);
