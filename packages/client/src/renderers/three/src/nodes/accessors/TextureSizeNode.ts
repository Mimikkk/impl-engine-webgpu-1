import { Node } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { TextureNode } from './TextureNode.js';
import { NodeType } from '../core/constants.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

class TextureSizeNode extends Node {
  isTextureSizeNode: boolean = true;
  textureNode: TextureNode;
  levelNode: Node | null;

  constructor(textureNode: TextureNode, levelNode: Node | null = null) {
    super(NodeType.UnsignedVector2);
    this.textureNode = textureNode;
    this.levelNode = levelNode;
  }

  generate(builder: NodeBuilder, output: string) {
    const textureProperty = this.textureNode.build(builder, 'property');
    const levelNode = this.levelNode?.build(builder, 'int');

    return builder.format(`textureDimensions(${textureProperty}, ${levelNode})`, this.getNodeType(builder), output);
  }
}

export const textureSize = nodeProxy(TextureSizeNode);

addNodeElement('textureSize', textureSize);
