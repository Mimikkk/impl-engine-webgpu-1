import { Node } from './Node.js';

import { varying } from './VaryingNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { NodeType } from './constants.js';
import { NodeBuilder } from './NodeBuilder.js';

export class AttributeNode extends Node {
  _attributeName: string | null;

  constructor(attributeName: string | null, nodeType: NodeType | null = null) {
    super(nodeType);

    this._attributeName = attributeName;
  }

  getHash(builder: NodeBuilder) {
    return this.getAttributeName(builder)!;
  }

  getNodeType(builder: NodeBuilder) {
    const attributeName = this.getAttributeName(builder);

    let nodeType = super.getNodeType(builder);

    if (nodeType === null) {
      if (builder.hasGeometryAttribute(attributeName)) {
        const attribute = builder.geometry.getAttribute(attributeName);

        nodeType = builder.getTypeFromAttribute(attribute);
      } else {
        nodeType = 'float';
      }
    }

    return nodeType;
  }

  setAttributeName(attributeName: string) {
    this._attributeName = attributeName;

    return this;
  }

  getAttributeName(builder: NodeBuilder) {
    return this._attributeName;
  }

  generate(builder: NodeBuilder) {
    const attributeName = this.getAttributeName(builder);
    const nodeType = this.getNodeType(builder);
    const geometryAttribute = builder.hasGeometryAttribute(attributeName);

    if (geometryAttribute === true) {
      const attribute = builder.geometry.getAttribute(attributeName);
      const attributeType = builder.getTypeFromAttribute(attribute);

      const nodeAttribute = builder.getAttribute(attributeName, attributeType);

      if (builder.shaderStage === 'vertex') {
        return builder.format(nodeAttribute.name, attributeType, nodeType);
      } else {
        const nodeVarying = varying(this);

        return nodeVarying.build(builder, nodeType);
      }
    } else {
      console.warn(`AttributeNode: Attribute "${attributeName}" not found.`);

      return builder.getConst(nodeType);
    }
  }
}

export const attribute = (name: string, nodeType: NodeType | null = null) =>
  nodeObject(new AttributeNode(name, nodeType));
