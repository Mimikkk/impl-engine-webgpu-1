import { Texture } from './Texture.js';
import {
  DepthFormat,
  DepthStencilFormat,
  NearestFilter,
  UnsignedInt248Type,
  UnsignedIntType,
} from '../../common/Constants.js';

export class DepthTexture extends Texture {
  isDepthTexture: boolean;
  compareFunction: null;
  constructor(
    width: number,
    height: number,
    type: number,
    mapping: number,
    wrapS: number,
    wrapT: number,
    magFilter: number,
    minFilter: number,
    anisotropy: number,
    format: number,
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

  toJSON(meta: any) {
    const data = super.toJSON(meta);

    if (this.compareFunction !== null) data.compareFunction = this.compareFunction;

    return data;
  }
}
