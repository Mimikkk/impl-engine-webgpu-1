import { Texture } from './Texture.js';
import {
  MagnificationTextureFilter,
  Mapping,
  MinificationTextureFilter,
  PixelFormat,
  TextureDataType,
  Wrapping,
} from '../constants.js';

export class CanvasTexture extends Texture {
  declare isCanvasTexture: true;

  constructor(
    canvas: TexImageSource | OffscreenCanvas,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: MagnificationTextureFilter,
    minFilter?: MinificationTextureFilter,
    format?: PixelFormat,
    type?: TextureDataType,
    anisotropy?: number,
  ) {
    super(canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);

    this.isCanvasTexture = true;

    this.needsUpdate = true;
  }
}
