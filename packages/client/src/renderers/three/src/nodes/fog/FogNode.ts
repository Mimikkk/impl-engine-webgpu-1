import { Node } from '../core/Node.js';
import { NodeType } from '../core/constants.js';

export class FogNode extends Node {
  isFogNode: boolean = true;
  colorNode: Node;
  factorNode?: Node;

  constructor(colorNode: Node, factorNode?: Node) {
    super(NodeType.Float);

    this.isFogNode = true;
    this.colorNode = colorNode;
    this.factorNode = factorNode;
  }

  mixAssign(outputNode: Node) {
    return this.mix(outputNode, this.colorNode);
  }

  construct() {
    return this.factorNode;
  }
}
