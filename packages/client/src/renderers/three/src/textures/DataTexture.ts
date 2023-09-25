import { Texture } from './Texture.js';
import { NearestFilter } from '../constants.js';
import {
  ColorSpace,
  MagnificationTextureFilter,
  Mapping,
  MinificationTextureFilter,
  PixelFormat,
  TextureDataType,
  Wrapping,
} from 'three/src/constants.js';

export class DataTexture extends Texture {
  declare isDataTexture: true;

  constructor(
    data: BufferSource | null = null,
    width: number = 1,
    height: number = 1,
    format?: PixelFormat,
    type?: TextureDataType,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter: MagnificationTextureFilter = NearestFilter,
    minFilter: MinificationTextureFilter = NearestFilter,
    anisotropy?: number,
    colorSpace?: ColorSpace,
  ) {
    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);

    this.isDataTexture = true;

    this.image = { data: data, width: width, height: height };

    this.generateMipmaps = false;
    this.flipY = false;
    this.unpackAlignment = 1;
  }
}
