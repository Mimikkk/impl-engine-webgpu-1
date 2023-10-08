import { UniformNode } from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { TextureNode } from '../accessors/TextureNode.js';

export class MaxMipLevelNode extends UniformNode {
  textureNode: TextureNode;

  constructor(textureNode: TextureNode) {
    super(0);

    this.textureNode = textureNode;

    this.updateType = NodeUpdateType.Frame;
  }

  get texture() {
    return this.textureNode.value;
  }

  update() {
    const texture = this.texture;
    const images = texture.images;
    const image = images && images.length > 0 ? (images[0] && images[0].image) || images[0] : texture.image;

    if (image && image.width !== undefined) {
      const { width, height } = image;

      this.value = Math.log2(Math.max(width, height));
    }
  }
}

export const maxMipLevel = nodeProxy(MaxMipLevelNode);
