import Binding, { ShaderStage } from './Binding.js';
import { Texture } from 'three';

let id = 0;

class SampledTexture extends Binding {
  name: string;
  visibility: ShaderStage;
  texture: Texture;
  version: number;
  id: number;
  isSampledTexture: boolean;

  constructor(name: string, texture: Texture) {
    super(name);
    this.id = ++id;

    this.texture = texture;
    this.version = texture.version;
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
}

class SampledCubeTexture extends SampledTexture {
  isSampledCubeTexture: boolean;

  constructor(name: string, texture: Texture) {
    super(name, texture);
    this.isSampledCubeTexture = true;
  }
}

export { SampledTexture, SampledCubeTexture };
