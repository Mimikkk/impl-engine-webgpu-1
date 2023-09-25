import { Texture } from './Texture.js';
import { NearestFilter } from '../constants.js';

export class FramebufferTexture extends Texture {
  declare isFramebufferTexture: true;

  constructor(width: number, height: number) {
    super({ width, height });

    this.isFramebufferTexture = true;

    this.magFilter = NearestFilter;
    this.minFilter = NearestFilter;

    this.generateMipmaps = false;

    this.needsUpdate = true;
  }
}
