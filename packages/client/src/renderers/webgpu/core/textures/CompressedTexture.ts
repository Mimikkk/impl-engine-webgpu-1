import { Texture } from './Texture.js';

export class CompressedTexture extends Texture {
  isCompressedTexture: boolean;
  constructor(
    mipmaps: any,
    width: number,
    height: number,
    format: number,
    type: number,
    mapping: number,
    wrapS: number,
    wrapT: number,
    magFilter: number,
    minFilter: number,
    anisotropy: number,
    colorSpace: string,
  ) {
    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);

    this.isCompressedTexture = true;

    this.image = { width: width, height: height };
    this.mipmaps = mipmaps;

    // no flipping for cube textures
    // (also flipping doesn't work for compressed textures )

    this.flipY = false;

    // can't generate mipmaps for compressed textures
    // mips must be embedded in DDS files

    this.generateMipmaps = false;
  }
}
