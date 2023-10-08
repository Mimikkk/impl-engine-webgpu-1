import { Node } from '../core/Node.js';
import { BufferAttributeNodes } from './BufferAttributeNode.js';
import { NormalNodes } from './NormalNode.js';
import { PositionNodes } from './PositionNode.js';
import { mat3, mat4, nodeProxy, vec3 } from '../shadernode/ShaderNode.js';
import { DynamicDrawUsage, InstancedInterleavedBuffer, InstancedMesh } from '../../Three.js';
import { Matrix4NodeUniform } from '../../common/nodes/NodeUniform.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

import { NodeType } from '../core/constants.js';

export class InstanceNode extends Node {
  instanceMesh: InstancedMesh;
  instanceMatrixNode: Matrix4NodeUniform | null;

  constructor(instanceMesh: InstancedMesh) {
    super(NodeType.Void);

    this.instanceMesh = instanceMesh;
    this.instanceMatrixNode = null;
  }

  construct(builder: NodeBuilder) {
    let instanceMatrixNode = this.instanceMatrixNode;

    if (instanceMatrixNode === null) {
      const instanceMesh = this.instanceMesh;
      const instanceAttribute = instanceMesh.instanceMatrix;
      const buffer = new InstancedInterleavedBuffer(instanceAttribute.array, 16, 1);

      const bufferFn =
        instanceAttribute.usage === DynamicDrawUsage
          ? BufferAttributeNodes.instanced.dynamic
          : BufferAttributeNodes.instanced.normal;

      const instanceBuffers = [
        bufferFn(buffer, NodeType.Vector4, 16, 0),
        bufferFn(buffer, NodeType.Vector4, 16, 4),
        bufferFn(buffer, NodeType.Vector4, 16, 8),
        bufferFn(buffer, NodeType.Vector4, 16, 12),
      ];

      instanceMatrixNode = mat4(...instanceBuffers);

      this.instanceMatrixNode = instanceMatrixNode;
    }

    // POSITION

    const instancePosition = instanceMatrixNode!.mul(PositionNodes.local).xyz;

    // NORMAL

    const m = mat3(instanceMatrixNode[0].xyz, instanceMatrixNode[1].xyz, instanceMatrixNode[2].xyz);

    const transformedNormal = NormalNodes.local.div(vec3(m[0].dot(m[0]), m[1].dot(m[1]), m[2].dot(m[2])));

    const instanceNormal = m.mul(transformedNormal).xyz;

    // ASSIGNS

    builder.stack.assign(PositionNodes.local, instancePosition);
    builder.stack.assign(NormalNodes.local, instanceNormal);
  }
}

export const instance = nodeProxy(InstanceNode);
