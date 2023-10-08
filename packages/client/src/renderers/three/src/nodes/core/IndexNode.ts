import { Node } from './Node.js';

import { varying } from './VaryingNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeShaderStage, NodeType } from './constants.js';
import { NodeBuilder } from './NodeBuilder.js';

export class IndexNode extends Node {
  scope: IndexNode.Scope;

  constructor(scope: IndexNode.Scope) {
    super(NodeType.UnsignedInteger);

    this.scope = scope;
  }

  generate(builder: NodeBuilder) {
    const nodeType = this.getNodeType(builder);
    const scope = this.scope;

    let propertyName;

    if (scope === IndexNode.Scope.VERTEX) {
      propertyName = builder.getVertexIndex();
    } else if (scope === IndexNode.Scope.INSTANCE) {
      propertyName = builder.getInstanceIndex();
    }

    switch (builder.shaderStage) {
      case NodeShaderStage.Vertex:
      case NodeShaderStage.Compute:
        return propertyName;
      case NodeShaderStage.Fragment:
        return varying(this).build(builder, nodeType);
    }
  }
}

export namespace IndexNode {
  export enum Scope {
    VERTEX = 'vertex',
    INSTANCE = 'instance',
  }
}
export namespace IndexNodes {
  export const vertex = nodeImmutable(IndexNode, IndexNode.Scope.VERTEX);
  export const instance = nodeImmutable(IndexNode, IndexNode.Scope.INSTANCE);
}

export const vertexIndex = nodeImmutable(IndexNode, IndexNode.Scope.VERTEX);
export const instanceIndex = nodeImmutable(IndexNode, IndexNode.Scope.INSTANCE);
