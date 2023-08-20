import { BindingState, createBinding } from './Binding.js';
import { Texture } from 'three';
import { ShaderStage } from './ShaderStage.js';

let id = 0;

export class SampledCubemap {
  name: string;
  texture: Texture;
  version: number;
  id: number;
  isSampledTexture: boolean;
  isSampledCubeTexture: boolean;
  binding: BindingState;

  constructor(name: string, texture: Texture) {
    this.binding = createBinding(name);
    this.name = name;

    this.id = ++id;
    this.texture = texture;
    this.version = texture.version;
    this.isSampledTexture = true;
    this.isSampledCubeTexture = true;
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
