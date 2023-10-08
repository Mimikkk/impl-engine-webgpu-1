import { Node } from './Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from './NodeBuilder.js';
import { NodeType } from './constants.js';

export class ContextNode extends Node {
  node: Node;
  context: any;

  constructor(node: Node, context: Record<any, any> = {}) {
    super();

    this.node = node;
    this.context = context;
  }

  getNodeType(builder: NodeBuilder) {
    return this.node.getNodeType(builder);
  }

  construct(builder: NodeBuilder) {
    const previousContext = builder.getContext();

    builder.setContext({ ...builder.context, ...this.context });

    const node = this.node.build(builder);

    builder.setContext(previousContext);

    return node;
  }

  generate(builder: NodeBuilder, output?: NodeType) {
    const previousContext = builder.getContext();

    builder.setContext({ ...builder.context, ...this.context });

    const snippet = this.node.build(builder, output);

    builder.setContext(previousContext);

    return snippet;
  }
}

export const context = nodeProxy(ContextNode);
export const label = (node: Node, name: string) => context(node, { label: name });

addNodeElement('context', context);
addNodeElement('label', label);
