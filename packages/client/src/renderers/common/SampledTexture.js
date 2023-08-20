import Binding from './Binding.ts';

let id = 0;

class SampledTexture extends Binding {
  constructor(name, texture) {
    super(name);
    this.id = ++id;

    this.texture = texture;
    this.version = texture.version;

    this.isSampledTexture = true;
  }

  get needsBindingsUpdate() {
    const { texture, version } = this;

    return texture.isVideoTexture ? true : version !== texture.version; // @TODO: version === 0 && texture.version > 0 ( add it just to External Textures like PNG,JPG )
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
  constructor(name, texture) {
    super(name, texture);

    this.isSampledCubeTexture = true;
  }
}

export { SampledTexture, SampledCubeTexture };
