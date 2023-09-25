import { Texture } from './Texture.js';
import { ClampToEdgeWrapping, NearestFilter, Wrapping } from '../constants.js';

export class Data3DTexture extends Texture {
  declare isData3DTexture: true;
  wrapR: Wrapping;

  constructor(data: BufferSource | null = null, width: number = 1, height: number = 1, depth: number = 1) {
    super(null);

    this.isData3DTexture = true;

    this.image = { data, width, height, depth };

    this.magFilter = NearestFilter;
    this.minFilter = NearestFilter;

    this.wrapR = ClampToEdgeWrapping;

    this.generateMipmaps = false;
    this.flipY = false;
    this.unpackAlignment = 1;
  }
}
