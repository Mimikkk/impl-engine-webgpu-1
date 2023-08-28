import { BindingState, createBinding } from '../Binding.js';
import { TextureNode } from 'three/examples/jsm/nodes/Nodes.js';
import { ShaderStage } from '../ShaderStage.js';
import { Texture } from '../../core/textures/Texture.js';

class NodeSampler {
  name: string;
  binding: BindingState;
  texture: Texture;
  version: any;
  isSampler: boolean;
  textureNode: TextureNode;

  constructor(name: string, textureNode: TextureNode) {
    this.binding = createBinding(name);
    this.texture = textureNode.value as unknown as Texture;

    this.version = this.texture.version;
    this.isSampler = true;
    this.textureNode = textureNode;
  }

  setVisibility = (visibility: ShaderStage) => this.binding.actions.visibility.toggle(visibility);
  get visibility() {
    return this.binding.state.visibility;
  }
}

export const createNodeSampler = (name: string, node: TextureNode) => new NodeSampler(name, node);
