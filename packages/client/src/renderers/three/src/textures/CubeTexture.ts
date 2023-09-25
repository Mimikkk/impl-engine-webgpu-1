import { Texture } from './Texture.js';
import { CubeReflectionMapping } from '../constants.js';
import {
  ColorSpace,
  CubeTextureMapping,
  MagnificationTextureFilter,
  MinificationTextureFilter,
  PixelFormat,
  TextureDataType,
  Wrapping,
} from 'three/src/constants.js';

export class CubeTexture extends Texture {
  declare isCubeTexture: true;

  constructor(
    images?: (HTMLImageElement | HTMLCanvasElement)[],
    mapping?: CubeTextureMapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: MagnificationTextureFilter,
    minFilter?: MinificationTextureFilter,
    format?: PixelFormat,
    type?: TextureDataType,
    anisotropy?: number,
    colorSpace?: ColorSpace,
  ) {
    images = images !== undefined ? images : [];
    mapping = mapping !== undefined ? mapping : CubeReflectionMapping;

    super(images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);

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
