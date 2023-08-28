import { CubeReflectionMapping } from '../../common/Constants.js';
import { CompressedTexture } from './CompressedTexture.js';

export class CompressedCubeTexture extends CompressedTexture {
  isCompressedCubeTexture: boolean;
  isCubeTexture: boolean;
  constructor(images: any[], format: number, type: number) {
    super(undefined, images[0].width, images[0].height, format, type, CubeReflectionMapping);

    this.isCompressedCubeTexture = true;
    this.isCubeTexture = true;

    this.image = images;
  }
}
