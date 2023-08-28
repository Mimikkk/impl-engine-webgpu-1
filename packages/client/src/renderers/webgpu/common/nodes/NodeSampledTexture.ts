import { TextureNode } from 'three/examples/jsm/nodes/Nodes.js';
import { BindingState, createBinding } from '../Binding.js';
import { ShaderStage } from '../ShaderStage.js';
import { Texture } from '../../core/textures/Texture.js';

export class NodeSampledTexture {
  name: string;
  texture: Texture;
  version: number;
  id: number;
  isSampledTexture: boolean;
  binding: BindingState;

  constructor(name: string, texture: TextureNode) {
    this.binding = createBinding(name);
    this.name = name;

    this.texture = texture.value as unknown as Texture;
    this.version = this.texture.version;
    this.isSampledTexture = true;
  }

  get needsBindingsUpdate() {
    const { texture } = this;

    //@ts-expect-error
    return this.texture.isVideoTexture ? true : this.version !== texture.version;
  }

  update() {
    if (this.version !== this.texture.version) {
      this.version = this.texture.version;
      return true;
    }

    return false;
  }

  setVisibility = (visibility: ShaderStage) => this.binding.actions.visibility.toggle(visibility);
  get visibility() {
    return this.binding.state.visibility;
  }
}
