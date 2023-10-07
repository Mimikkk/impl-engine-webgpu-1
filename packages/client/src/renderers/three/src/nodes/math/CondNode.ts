import { Node } from '../core/Node.js';
import { PropertyNodes } from '../core/PropertyNode.js';
import { context as contextNode } from '../core/ContextNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

export class CondNode extends Node {
  condNode: Node;
  ifNode: Node;
  elseNode: Node | null;

  constructor(condNode: Node, ifNode: Node, elseNode: Node | null = null) {
    super();

    this.condNode = condNode;
    this.ifNode = ifNode;
    this.elseNode = elseNode;
  }

  getNodeType(builder: NodeBuilder): NodeType | null {
    const ifType = this.ifNode.getNodeType(builder);

    if (this.elseNode) {
      const elseType = this.elseNode.getNodeType(builder);
      if (builder.getTypeLength(elseType) > builder.getTypeLength(ifType)) return elseType as NodeType;
    }

    return ifType as NodeType;
  }

  generate(builder: NodeBuilder) {
    const type = this.getNodeType(builder);
    const context = { tempWrite: false };

    const { ifNode, elseNode } = this;

    const needsProperty =
      ifNode.getNodeType(builder) !== 'void' || (elseNode && elseNode.getNodeType(builder) !== 'void');
    const nodeProperty = needsProperty ? PropertyNodes.property(type!).build(builder) : '';

    const nodeSnippet = contextNode(this.condNode /*, context*/).build(builder, 'bool');

    builder.addFlowCode(`\n${builder.tab}if ( ${nodeSnippet} ) {\n\n`).addFlowTab();

    let ifSnippet = contextNode(this.ifNode, context).build(builder, type);

    ifSnippet = needsProperty ? nodeProperty + ' = ' + ifSnippet + ';' : ifSnippet;

    builder.removeFlowTab().addFlowCode(builder.tab + '\t' + ifSnippet + '\n\n' + builder.tab + '}');

    if (elseNode !== null) {
      builder.addFlowCode(' else {\n\n').addFlowTab();

      let elseSnippet = contextNode(elseNode, context).build(builder, type);
      elseSnippet = nodeProperty ? nodeProperty + ' = ' + elseSnippet + ';' : elseSnippet;

      builder.removeFlowTab().addFlowCode(builder.tab + '\t' + elseSnippet + '\n\n' + builder.tab + '}\n\n');
    } else {
      builder.addFlowCode('\n\n');
    }

    return nodeProperty;
  }
}

export const cond = nodeProxy(CondNode);

addNodeElement('cond', cond);
