import { Node } from './Node.js';
import { nodeImmutable, nodeObject } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from './NodeBuilder.js';

class PropertyNode extends Node {
  name: string | null;

  constructor(nodeType: string, name: string | null = null) {
    super(nodeType);
    this.name = name;
  }

  getHash(builder: NodeBuilder) {
    return this.name || super.getHash(builder);
  }

  isGlobal(builder: NodeBuilder) {
    return true;
  }

  generate(builder: NodeBuilder) {
    const nodeVary = builder.getVarFromNode(this, this.getNodeType(builder));
    const name = this.name;

    if (name !== null) {
      nodeVary.name = name;
    }

    return builder.getPropertyName(nodeVary);
  }
}

export default PropertyNode;

export const property = (type: string, name: string | null) => nodeObject(new PropertyNode(type, name));

export const diffuseColor = nodeImmutable(PropertyNode, 'vec4', 'DiffuseColor');
export const roughness = nodeImmutable(PropertyNode, 'float', 'Roughness');
export const metalness = nodeImmutable(PropertyNode, 'float', 'Metalness');
export const clearcoat = nodeImmutable(PropertyNode, 'float', 'Clearcoat');
export const clearcoatRoughness = nodeImmutable(PropertyNode, 'float', 'ClearcoatRoughness');
export const sheen = nodeImmutable(PropertyNode, 'vec3', 'Sheen');
export const sheenRoughness = nodeImmutable(PropertyNode, 'float', 'SheenRoughness');
export const iridescence = nodeImmutable(PropertyNode, 'float', 'Iridescence');
export const iridescenceIOR = nodeImmutable(PropertyNode, 'float', 'IridescenceIOR');
export const iridescenceThickness = nodeImmutable(PropertyNode, 'float', 'IridescenceThickness');
export const specularColor = nodeImmutable(PropertyNode, 'color', 'SpecularColor');
export const shininess = nodeImmutable(PropertyNode, 'float', 'Shininess');
export const output = nodeImmutable(PropertyNode, 'vec4', 'Output');
