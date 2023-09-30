import { Node } from './Node.js';
import { nodeImmutable, nodeObject } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from './NodeBuilder.js';
import { NodeType } from './constants.js';

export class PropertyNode extends Node {
  name: string | null;

  constructor(nodeType: NodeType, name: string | null = null) {
    super(nodeType);
    this.name = name;
  }

  getHash(builder: NodeBuilder) {
    return this.name || super.getHash(builder);
  }

  isGlobal() {
    return true;
  }

  generate(builder: NodeBuilder) {
    const nodeVary = builder.getVarFromNode(this, this.getNodeType(builder));
    const name = this.name;

    if (name) nodeVary.name = name;

    return builder.getPropertyName(nodeVary);
  }
}

export namespace PropertyNodes {
  export const property = (type: NodeType, name: string | null = null) => nodeObject(new PropertyNode(type, name));
  export const diffuseColor = nodeImmutable(PropertyNode, NodeType.Vector4, 'DiffuseColor');
  export const roughness = nodeImmutable(PropertyNode, NodeType.Float, 'Roughness');
  export const metalness = nodeImmutable(PropertyNode, NodeType.Float, 'Metalness');
  export const clearcoat = nodeImmutable(PropertyNode, NodeType.Float, 'Clearcoat');
  export const clearcoatRoughness = nodeImmutable(PropertyNode, NodeType.Float, 'ClearcoatRoughness');
  export const sheen = nodeImmutable(PropertyNode, NodeType.Vector3, 'Sheen');
  export const sheenRoughness = nodeImmutable(PropertyNode, NodeType.Float, 'SheenRoughness');
  export const iridescence = nodeImmutable(PropertyNode, NodeType.Float, 'Iridescence');
  export const iridescenceIOR = nodeImmutable(PropertyNode, NodeType.Float, 'IridescenceIOR');
  export const iridescenceThickness = nodeImmutable(PropertyNode, NodeType.Float, 'IridescenceThickness');
  export const specularColor = nodeImmutable(PropertyNode, NodeType.Color, 'SpecularColor');
  export const shininess = nodeImmutable(PropertyNode, NodeType.Float, 'Shininess');
  export const output = nodeImmutable(PropertyNode, NodeType.Vector4, 'Output');
}
