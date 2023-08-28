import { Texture } from './Texture.js';
import { CubeReflectionMapping } from '../../common/Constants.js';

export class CubeTexture extends Texture {
  isCubeTexture: boolean;

  constructor(
    images: any[],
    mapping: number,
    wrapS: number,
    wrapT: number,
    magFilter: number,
    minFilter: number,
    format: number,
    type: number,
    anisotropy: number,
    colorSpace: string,
  ) {
    images = images !== undefined ? images : [];
    mapping = mapping !== undefined ? mapping : CubeReflectionMapping;

    super(images as any, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);

    this.isCubeTexture = true;

    this.flipY = false;
  }

  get images() {
    return this.image;
  }

  set images(value) {
    this.image = value;
  }
}
