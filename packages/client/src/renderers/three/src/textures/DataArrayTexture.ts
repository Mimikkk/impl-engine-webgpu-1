import { Texture } from './Texture.js';
import { ClampToEdgeWrapping, NearestFilter, Wrapping } from '../constants.js';

export class DataArrayTexture extends Texture {
  declare isDataArrayTexture: true;
  wrapR: Wrapping;

  constructor(data: BufferSource | null = null, width: number = 1, height: number = 1, depth: number = 1) {
    super(null);

    this.isDataArrayTexture = true;

    this.image = { data, width, height, depth };

    this.magFilter = NearestFilter;
    this.minFilter = NearestFilter;

    this.wrapR = ClampToEdgeWrapping;

    this.generateMipmaps = false;
    this.flipY = false;
    this.unpackAlignment = 1;
  }
}
