import { Texture } from './Texture.js';
import {
  DeepTexturePixelFormat,
  DepthFormat,
  DepthStencilFormat,
  MagnificationTextureFilter,
  Mapping,
  MinificationTextureFilter,
  NearestFilter,
  TextureComparisonFunction,
  TextureDataType,
  UnsignedInt248Type,
  UnsignedIntType,
  Wrapping,
} from '../constants.js';

export class DepthTexture extends Texture {
  static is(value: any): value is DepthTexture {
    return value && value.isDepthTexture;
  }

  isDepthTexture: true;
  compareFunction: TextureComparisonFunction | null;

  constructor(
    width: number,
    height: number,
    type?: TextureDataType,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: MagnificationTextureFilter,
    minFilter?: MinificationTextureFilter,
    anisotropy?: number,
    format?: DeepTexturePixelFormat,
  ) {
    format = format !== undefined ? format : DepthFormat;

    if (format !== DepthFormat && format !== DepthStencilFormat) {
      throw new Error('DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat');
    }

    if (type === undefined && format === DepthFormat) type = UnsignedIntType;
    if (type === undefined && format === DepthStencilFormat) type = UnsignedInt248Type;

    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);

    this.isDepthTexture = true;

    this.image = { width: width, height: height };

    this.magFilter = magFilter !== undefined ? magFilter : NearestFilter;
    this.minFilter = minFilter !== undefined ? minFilter : NearestFilter;

    this.flipY = false;
    this.generateMipmaps = false;

    this.compareFunction = null;
  }

  copy(source: DepthTexture) {
    super.copy(source);

    this.compareFunction = source.compareFunction;

    return this;
  }
}
