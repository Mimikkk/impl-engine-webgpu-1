import { ClampToEdgeWrapping } from '../../common/Constants.js';
import { CompressedTexture } from './CompressedTexture.js';

export class CompressedArrayTexture extends CompressedTexture {
  isCompressedArrayTexture: boolean;
  wrapR: number;
  constructor(mipmaps: number, width: number, height: number, depth: number, format: number, type: number) {
    super(mipmaps, width, height, format, type);

    this.isCompressedArrayTexture = true;
    this.image.depth = depth;
    this.wrapR = ClampToEdgeWrapping;
  }
}
