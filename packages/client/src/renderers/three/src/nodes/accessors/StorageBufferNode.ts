import { BufferNode } from './BufferNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

import { NodeType } from '../core/constants.js';

export class StorageBufferNode extends BufferNode {
  isStorageBufferNode: boolean = true;

  constructor(value: any, bufferType: NodeType, bufferCount: number = 0) {
    super(value, bufferType, bufferCount);
  }

  getInputType(builder: NodeBuilder) {
    return 'storageBuffer';
  }
}

export const storage = (value: any, type: NodeType, count: number) =>
  nodeObject(new StorageBufferNode(value, type, count));
