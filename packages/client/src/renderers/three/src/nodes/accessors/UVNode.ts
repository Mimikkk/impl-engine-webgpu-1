import { AttributeNode } from '../core/AttributeNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

import { NodeType } from '../core/constants.js';

export class UVNode extends AttributeNode {
  index: number;
  isUVNode: boolean = true;

  constructor(index: number = 0) {
    super(null, NodeType.Vector2);
    this.index = index;
  }

  getAttributeName(builder: NodeBuilder) {
    return `uv${this.index > 0 ? this.index : ''}`;
  }
}

export const uv = (index: number = 0) => nodeObject(new UVNode(index));
