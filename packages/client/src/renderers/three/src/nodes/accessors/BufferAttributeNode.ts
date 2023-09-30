import { InputNode } from '../core/InputNode.js';
import { varying } from '../core/VaryingNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import {
  DynamicDrawUsage,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  StaticDrawUsage,
  Usage,
} from '../../Three.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NumberArray } from '../../types.js';
import { NodeType } from '../core/constants.js';

export class BufferAttributeNode extends InputNode {
  isBufferNode: boolean = true;

  bufferType: NodeType;
  bufferStride: number;
  bufferOffset: number;
  usage: Usage = StaticDrawUsage;
  instanced: boolean = false;
  attribute: InterleavedBufferAttribute;

  constructor(value: NumberArray, bufferType: NodeType, bufferStride: number = 0, bufferOffset: number = 0) {
    super(value, bufferType);
    this.bufferType = bufferType;
    this.bufferStride = bufferStride;
    this.bufferOffset = bufferOffset;
  }

  construct(builder: NodeBuilder) {
    const type = this.getNodeType(builder);
    const array = this.value;
    const itemSize = builder.getTypeLength(type);
    const stride = this.bufferStride || itemSize;
    const offset = this.bufferOffset;

    const buffer = InterleavedBuffer.is(array) ? array : new InterleavedBuffer(array as any, stride);
    const bufferAttribute = new InterleavedBufferAttribute(buffer, itemSize, offset);

    buffer.setUsage(this.usage);

    this.attribute = bufferAttribute;
    //@ts-expect-error
    this.attribute.isInstancedBufferAttribute = this.instanced;
    return null;
  }

  generate(builder: NodeBuilder) {
    const nodeType = this.getNodeType(builder);

    const nodeUniform = builder.getBufferAttributeFromNode(this, nodeType);
    const propertyName = builder.getPropertyName(nodeUniform);

    let output = null;

    if (builder.shaderStage === 'vertex') {
      output = propertyName;
    } else {
      const nodeVarying = varying(this);

      output = nodeVarying.build(builder, nodeType);
    }

    return output;
  }

  getInputType(builder: NodeBuilder) {
    return 'bufferAttribute';
  }

  setUsage(value: Usage) {
    this.usage = value;

    return this;
  }

  setInstanced(value: boolean) {
    this.instanced = value;

    return this;
  }
}

export namespace BufferAttributeNodes {
  export const normal = (array: NumberArray, type: NodeType, stride: number = 0, offset: number = 0) =>
    nodeObject(new BufferAttributeNode(array, type, stride, offset));

  export const dynamic = (array: NumberArray, type: NodeType, stride: number = 0, offset: number = 0) =>
    normal(array, type, stride, offset).setUsage(DynamicDrawUsage);

  export namespace instanced {
    export const normal = (array: NumberArray, type: NodeType, stride: number = 0, offset: number = 0) =>
      BufferAttributeNodes.normal(array, type, stride, offset).setInstanced(true);

    export const dynamic = (array: NumberArray, type: NodeType, stride: number = 0, offset: number = 0) =>
      BufferAttributeNodes.dynamic(array, type, stride, offset).setInstanced(true);
  }
}
