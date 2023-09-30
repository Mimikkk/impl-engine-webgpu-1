import { Node } from '../core/Node.js';
import { NodeType, NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { uniform, UniformNode } from '../core/UniformNode.js';
import { reference } from './ReferenceNode.js';
import { BufferAttributeNodes } from './BufferAttributeNode.js';
import { PositionNode, PositionNodes } from './PositionNode.js';
import { Mesh } from '../../objects/Mesh.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

export class MorphNode extends Node {
  mesh: Mesh;
  morphBaseInfluence: UniformNode;

  constructor(mesh: Mesh) {
    super(NodeType.Void);

    this.mesh = mesh;
    this.morphBaseInfluence = uniform(1);

    this.updateType = NodeUpdateType.Object;
  }

  constructAttribute(builder: NodeBuilder, name: string, assignNode: PositionNode = PositionNodes.local) {
    const mesh = this.mesh;
    const attributes = mesh.geometry.morphAttributes[name];

    builder.stack.assign(assignNode, assignNode.mul(this.morphBaseInfluence));

    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i];

      const bufferAttrib = BufferAttributeNodes.normal(attribute.array, 'vec3');
      const influence = reference(i, 'float', mesh.morphTargetInfluences);

      builder.stack.assign(assignNode, assignNode.add(bufferAttrib.mul(influence)));
    }
  }

  construct(builder: NodeBuilder) {
    this.constructAttribute(builder, 'position');
  }

  update() {
    const morphBaseInfluence = this.morphBaseInfluence;

    if (this.mesh.geometry.morphTargetsRelative) {
      morphBaseInfluence.value = 1;
    } else {
      morphBaseInfluence.value = 1 - this.mesh.morphTargetInfluences.reduce((a, b) => a + b, 0);
    }
  }
}

export const morph = nodeProxy(MorphNode);
