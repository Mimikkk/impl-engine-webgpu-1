import { SampledCubemap, SampledTexture } from '../SampledTexture.ts';

class NodeSampledTexture extends SampledTexture {
  constructor(name, textureNode) {
    super(name, textureNode.value);
  }
}

class NodeSampledCubemap extends SampledCubemap {
  constructor(name, textureNode) {
    super(name, textureNode.value);
  }
}

export { NodeSampledTexture, NodeSampledCubemap };
