import { Node } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { texture } from './TextureNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

import NodeFrame from '../core/NodeFrame.js';

class ReferenceNode extends Node {
  property: string;
  uniformType: string;
  object: any | null;
  node: Node | null;
  updateType: NodeUpdateType;

  constructor(property: string, uniformType: string, object: any | null = null) {
    super();

    this.property = property;

    this.uniformType = uniformType;

    this.object = object;

    this.node = null;

    this.updateType = NodeUpdateType.Object;

    this.setNodeType(uniformType);
  }

  setNodeType(uniformType: string) {
    if (uniformType === 'texture') {
      this.node = texture(null);
    } else {
      this.node = uniform(uniformType);
    }
  }

  getNodeType(builder: NodeBuilder) {
    return this.node!.getNodeType(builder);
  }

  update(frame: NodeFrame) {
    const object = this.object !== null ? this.object : frame.object;
    const property = this.property;

    //@ts-expect-error
    this.node!.value = object[property];
  }

  construct(): Node | null {
    return this.node;
  }
}

export default ReferenceNode;

export const reference = (name: string, type: string, object: any) => nodeObject(new ReferenceNode(name, type, object));
