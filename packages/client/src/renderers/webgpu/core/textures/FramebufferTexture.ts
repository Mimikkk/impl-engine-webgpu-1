import { Texture } from './Texture.js';
import { NearestFilter } from '../../common/Constants.js';

export class FramebufferTexture extends Texture {
  isFramebufferTexture: boolean;

  constructor(width: number, height: number) {
    super({ width, height } as any);

    this.isFramebufferTexture = true;

    this.magFilter = NearestFilter;
    this.minFilter = NearestFilter;

    this.generateMipmaps = false;

    this.needsUpdate = true;
  }
}
