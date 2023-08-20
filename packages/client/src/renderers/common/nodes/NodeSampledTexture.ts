import { SampledTexture } from '../SampledTexture.js';
import { TextureNode } from 'three/examples/jsm/nodes/Nodes.js';
import { Texture } from 'three';

export class NodeSampledTexture extends SampledTexture {
  constructor(name: string, textureNode: TextureNode) {
    super(name, textureNode.value as unknown as Texture);
  }
}
