import { Sampler } from '../Sampler.js';
import { TextureNode } from '../../nodes/accessors/TextureNode.js';

export class NodeSampler extends Sampler {
  textureNode: TextureNode;

  constructor(name: string, textureNode: TextureNode) {
    super(name, textureNode.value);

    this.textureNode = textureNode;
  }

  getTexture() {
    return this.textureNode.value;
  }
}
