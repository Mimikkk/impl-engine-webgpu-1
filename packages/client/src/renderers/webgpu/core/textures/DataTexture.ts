import { Texture } from './Texture.js';
import { NearestFilter } from '../../common/Constants.js';

export class DataTexture extends Texture {
  isDataTexture: boolean;
  constructor(
    data = null,
    width: number = 1,
    height: number = 1,
    format: number,
    type: number,
    mapping: number,
    wrapS: number,
    wrapT: number,
    magFilter: number = NearestFilter,
    minFilter: number = NearestFilter,
    anisotropy: number,
    colorSpace: string,
  ) {
    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);

    this.isDataTexture = true;

    this.image = { data: data, width: width, height: height };

    this.generateMipmaps = false;
    this.flipY = false;
    this.unpackAlignment = 1;
  }
}
