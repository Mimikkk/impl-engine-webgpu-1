import { Texture } from './Texture.js';
import { ClampToEdgeWrapping, NearestFilter } from '../../common/Constants.js';

export class DataArrayTexture extends Texture {
  isDataArrayTexture: boolean;
  wrapR: number;
  constructor(data = null, width = 1, height = 1, depth = 1) {
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
