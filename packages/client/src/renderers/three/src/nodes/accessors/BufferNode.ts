import { UniformNode } from '../core/UniformNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

export class BufferNode extends UniformNode {
  isBufferNode: boolean = true;
  bufferType: NodeType;
  bufferCount: number;

  constructor(value: any, bufferType: NodeType, bufferCount: number = 0) {
    super(value, bufferType);
    this.bufferType = bufferType;
    this.bufferCount = bufferCount;
  }

  getInputType(builder: NodeBuilder) {
    return 'buffer';
  }
}

export const buffer = (value: any, type: NodeType, count: number) => nodeObject(new BufferNode(value, type, count));
