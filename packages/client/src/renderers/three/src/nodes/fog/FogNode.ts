import { Node } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

export class FogNode extends Node {
  isFogNode: boolean = true;
  colorNode: Node;
  factorNode?: Node;

  constructor(colorNode: Node, factorNode?: Node) {
    super('float');

    this.isFogNode = true;
    this.colorNode = colorNode;
    this.factorNode = factorNode;
  }

  mixAssign(outputNode: Node) {
    return this.mix(outputNode, this.colorNode);
  }

  construct(): Node | undefined {
    return this.factorNode;
  }
}

export default FogNode;

export const fog = nodeProxy(FogNode);

addNodeElement('fog', fog);
