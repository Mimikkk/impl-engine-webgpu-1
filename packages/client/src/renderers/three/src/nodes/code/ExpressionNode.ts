import Node, { addNodeClass } from '../core/Node.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import NodeBuilder from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

class ExpressionNode extends Node {
  snippet: string;

  constructor(snippet: string = '', nodeType: string = 'void') {
    super(nodeType);

    this.snippet = snippet;
  }

  generate(builder: NodeBuilder, output: NodeType) {
    const type = this.getNodeType(builder);
    const snippet = this.snippet;

    if (type === 'void') {
      builder.addLineFlowCode(snippet);
    } else {
      return builder.format(`( ${snippet} )`, type, output);
    }
  }
}

export default ExpressionNode;

export const expression = nodeProxy(ExpressionNode);

addNodeClass(ExpressionNode);
