import { CondNode } from '../math/CondNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

let discardExpression: CondNode;

export class DiscardNode extends CondNode {
  constructor(condNode: CondNode) {
    discardExpression = discardExpression || expression('discard');

    super(condNode, discardExpression);
  }
}

export const discard = nodeProxy(DiscardNode);

addNodeElement('discard', discard);
