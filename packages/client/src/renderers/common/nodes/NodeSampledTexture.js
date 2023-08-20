import { SampledCubeTexture, SampledTexture } from '../SampledTexture.ts';

class NodeSampledTexture extends SampledTexture {
  constructor(name, textureNode) {
    super(name, textureNode.value);
  }
}

class NodeSampledCubeTexture extends SampledCubeTexture {
  constructor(name, textureNode) {
    super(name, textureNode.value);
  }
}

export { NodeSampledTexture, NodeSampledCubeTexture };
