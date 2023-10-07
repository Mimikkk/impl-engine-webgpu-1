import { Node } from '../core/Node.js';
import { NodeType, vectorComponents } from '../core/constants.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

const stringVectorComponents = vectorComponents.join('');

export class SplitNode extends Node {
  node: Node;
  components: 'x' | 'y' | 'z';

  constructor(node: Node, components: 'x' | 'y' | 'z' = 'x') {
    super();

    this.node = node;
    this.components = components;
  }

  getVectorLength() {
    let vectorLength = this.components.length;

    for (const c of this.components) {
      vectorLength = Math.max(vectorComponents.indexOf(c) + 1, vectorLength);
    }

    return vectorLength;
  }

  getNodeType(builder: NodeBuilder) {
    return builder.getTypeFromLength(this.components.length) as NodeType;
  }

  generate(builder: NodeBuilder, output?: NodeType) {
    const node = this.node;
    const nodeTypeLength = builder.getTypeLength(node.getNodeType(builder));

    if (nodeTypeLength > 1) {
      let type = null;

      if (this.getVectorLength() >= nodeTypeLength) {
        // needed to expand the input node
        type = builder.getTypeFromLength(this.getVectorLength());
      }

      const nodeSnippet = node.build(builder, type as NodeType);

      // unecessary swizzle
      if (
        this.components.length === nodeTypeLength &&
        this.components === stringVectorComponents.slice(0, this.components.length)
      )
        return builder.format(nodeSnippet, type, output);
      return builder.format(`${nodeSnippet}.${this.components}`, this.getNodeType(builder), output);
    }
    // ignore .components if .node returns float/integer
    return node.build(builder, output);
  }
}
