import { SampledTexture } from '../SampledTexture.js';
import { SampledCubemap } from '../SampledCubemap.js';
import { TextureNode } from 'three/examples/jsm/nodes/Nodes.js';
import { Texture } from 'three';

class NodeSampledTexture extends SampledTexture {
  constructor(name: string, textureNode: TextureNode) {
    super(name, textureNode.value as unknown as Texture);
  }
}

class NodeSampledCubemap extends SampledCubemap {
  constructor(name: string, textureNode: TextureNode) {
    super(name, textureNode.value as unknown as Texture);
  }
}

export { NodeSampledTexture, NodeSampledCubemap };
