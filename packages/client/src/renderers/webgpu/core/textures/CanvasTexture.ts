import { Texture } from './Texture.js';
import {
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  RGBAFormat,
  UnsignedByteType,
} from '../../common/Constants.js';

export class CanvasTexture extends Texture {
  isCanvasTexture: boolean;
  constructor(
    canvas: null = Texture.DEFAULT_IMAGE,
    mapping: number = Texture.DEFAULT_MAPPING,
    wrapS: number = ClampToEdgeWrapping,
    wrapT: number = ClampToEdgeWrapping,
    magFilter: number = LinearFilter,
    minFilter: number = LinearMipmapLinearFilter,
    format: number = RGBAFormat,
    type: number = UnsignedByteType,
    anisotropy: number = Texture.DEFAULT_ANISOTROPY,
  ) {
    super(canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);

    this.isCanvasTexture = true;

    this.needsUpdate = true;
  }
}
