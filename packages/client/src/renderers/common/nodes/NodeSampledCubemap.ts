import { SampledCubemap } from '../SampledCubemap.js';
import { TextureNode } from 'three/examples/jsm/nodes/Nodes.js';
import { Texture } from 'three';

export class NodeSampledCubemap extends SampledCubemap {
  constructor(name: string, textureNode: TextureNode) {
    super(name, textureNode.value as unknown as Texture);
  }
}
