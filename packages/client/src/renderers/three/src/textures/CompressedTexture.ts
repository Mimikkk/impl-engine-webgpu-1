import { Texture } from './Texture.js';
import {
  ColorSpace,
  CompressedPixelFormat,
  CubeTextureMapping,
  MagnificationTextureFilter,
  Mapping,
  MinificationTextureFilter,
  TextureDataType,
  Wrapping,
} from '../constants.js';

export class CompressedTexture extends Texture {
  declare isCompressedTexture: true;

  constructor(
    mipmaps: ImageData[],
    width: number,
    height: number,
    format: CompressedPixelFormat,
    type?: TextureDataType,
    mapping?: CubeTextureMapping | Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: MagnificationTextureFilter,
    minFilter?: MinificationTextureFilter,
    anisotropy?: number,
    colorSpace?: ColorSpace,
  ) {
    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);

    this.isCompressedTexture = true;

    this.image = { width: width, height: height };
    this.mipmaps = mipmaps;

    this.flipY = false;
    this.generateMipmaps = false;
  }
}
