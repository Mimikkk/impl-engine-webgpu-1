import { CompressedPixelFormat, CubeReflectionMapping, TextureDataType } from '../constants.js';
import { CompressedTexture } from './CompressedTexture.js';

export class CompressedCubeTexture extends CompressedTexture {
  declare isCompressedCubeTexture: true;
  declare isCubeTexture: true;

  constructor(images: ImageData[], format: CompressedPixelFormat, type: TextureDataType) {
    super([], images[0].width, images[0].height, format, type, CubeReflectionMapping);

    this.isCompressedCubeTexture = true;
    this.isCubeTexture = true;

    this.image = images;
  }
}
