import { ClampToEdgeWrapping, Wrapping } from '../constants.js';
import { CompressedTexture } from './CompressedTexture.js';
import { CompressedPixelFormat, TextureDataType } from 'three/src/constants.js';

export class CompressedArrayTexture extends CompressedTexture {
  declare isCompressedArrayTexture: true;
  wrapR: Wrapping;

  constructor(
    mipmaps: ImageData[],
    width: number,
    height: number,
    depth: number,
    format: CompressedPixelFormat,
    type?: TextureDataType,
  ) {
    super(mipmaps, width, height, format, type);

    this.isCompressedArrayTexture = true;
    this.image.depth = depth;
    this.wrapR = ClampToEdgeWrapping;
  }
}
