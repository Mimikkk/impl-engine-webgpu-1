import { EventDispatcher } from '../core/EventDispatcher.js';
import {
  ClampToEdgeWrapping,
  ColorSpace,
  CompressedPixelFormat,
  CubeTextureMapping,
  LinearEncoding,
  LinearFilter,
  LinearMipmapLinearFilter,
  MagnificationTextureFilter,
  Mapping,
  MinificationTextureFilter,
  MirroredRepeatWrapping,
  NoColorSpace,
  PixelFormat,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  sRGBEncoding,
  TextureDataType,
  UnsignedByteType,
  UVMapping,
  Wrapping,
} from '../constants.js';
import { MathUtils } from '../math/MathUtils.js';
import { Vector2 } from '../math/Vector2.js';
import { Matrix3 } from '../math/Matrix3.js';
import { Source } from './Source.js';
import { warnOnce } from '../utils.js';

let textureId = 0;

export class Texture extends EventDispatcher<'dispose'> {
  static DEFAULT_IMAGE: TexImageSource | OffscreenCanvas | null = null;
  static DEFAULT_MAPPING: Mapping = UVMapping;
  static DEFAULT_ANISOTROPY: number = 1;

  declare isTexture: true;
  declare id: number;
  uuid: string;
  name: string;
  source: Source;
  mipmaps: TexImageSource[];
  mapping: CubeTextureMapping | Mapping;
  channel: number;
  wrapS: Wrapping;
  wrapT: Wrapping;
  magFilter: MagnificationTextureFilter;
  minFilter: MinificationTextureFilter;
  anisotropy: number;
  format: CompressedPixelFormat | PixelFormat;
  internalFormat: CompressedPixelFormat | PixelFormat | null;
  type: TextureDataType;
  offset: Vector2;
  repeat: Vector2;
  center: Vector2;
  rotation: number;
  matrixAutoUpdate: boolean;
  matrix: Matrix3;
  generateMipmaps: boolean;
  premultiplyAlpha: boolean;
  flipY: boolean;
  unpackAlignment: number;
  colorSpace: ColorSpace;
  userData: any;
  version: number;
  onUpdate: null | (() => void);
  isRenderTargetTexture: boolean;
  needsPMREMUpdate: boolean;

  constructor(
    image:
      | TexImageSource
      | (HTMLImageElement | HTMLCanvasElement)[]
      | { width: number; height: number }
      | OffscreenCanvas
      | null = Texture.DEFAULT_IMAGE,
    mapping: CubeTextureMapping | Mapping = Texture.DEFAULT_MAPPING,
    wrapS: Wrapping = ClampToEdgeWrapping,
    wrapT: Wrapping = ClampToEdgeWrapping,
    magFilter: MagnificationTextureFilter = LinearFilter,
    minFilter: MinificationTextureFilter = LinearMipmapLinearFilter,
    format: CompressedPixelFormat | PixelFormat = RGBAFormat,
    type: TextureDataType = UnsignedByteType,
    anisotropy: number = Texture.DEFAULT_ANISOTROPY,
    colorSpace: ColorSpace = NoColorSpace,
  ) {
    super();

    this.isTexture = true;

    Object.defineProperty(this, 'id', { value: textureId++ });

    this.uuid = MathUtils.generateUUID();

    this.name = '';

    this.source = new Source(image);
    this.mipmaps = [];

    this.mapping = mapping;
    this.channel = 0;

    this.wrapS = wrapS;
    this.wrapT = wrapT;

    this.magFilter = magFilter;
    this.minFilter = minFilter;

    this.anisotropy = anisotropy;

    this.format = format;
    this.internalFormat = null;
    this.type = type;

    this.offset = new Vector2(0, 0);
    this.repeat = new Vector2(1, 1);
    this.center = new Vector2(0, 0);
    this.rotation = 0;

    this.matrixAutoUpdate = true;
    this.matrix = new Matrix3();

    this.generateMipmaps = true;
    this.premultiplyAlpha = false;
    this.flipY = true;
    this.unpackAlignment = 4; // valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)

    if (typeof colorSpace === 'string') {
      this.colorSpace = colorSpace;
    } else {
      // @deprecated, r152

      warnOnce('THREE.Texture: Property .encoding has been replaced by .colorSpace.');
      this.colorSpace = colorSpace === sRGBEncoding ? SRGBColorSpace : NoColorSpace;
    }

    this.userData = {};

    this.version = 0;
    this.onUpdate = null;

    this.isRenderTargetTexture = false; // indicates whether a texture belongs to a render target or not
    this.needsPMREMUpdate = false; // indicates whether this texture should be processed by PMREMGenerator or not (only relevant for render target textures)
  }

  get image() {
    return this.source.data;
  }

  set image(value: any) {
    this.source.data = value;
  }

  set needsUpdate(value: boolean) {
    if (value) {
      this.version++;
      this.source.needsUpdate = true;
    }
  }

  get encoding() {
    // @deprecated, r152

    warnOnce('THREE.Texture: Property .encoding has been replaced by .colorSpace.');
    return this.colorSpace === SRGBColorSpace ? sRGBEncoding : LinearEncoding;
  }

  set encoding(encoding) {
    // @deprecated, r152

    warnOnce('THREE.Texture: Property .encoding has been replaced by .colorSpace.');
    this.colorSpace = encoding === sRGBEncoding ? SRGBColorSpace : NoColorSpace;
  }

  updateMatrix() {
    this.matrix.setUvTransform(
      this.offset.x,
      this.offset.y,
      this.repeat.x,
      this.repeat.y,
      this.rotation,
      this.center.x,
      this.center.y,
    );
  }

  clone(): Texture {
    //@ts-ignore
    return new this.constructor().copy(this);
  }

  copy(source: Texture) {
    this.name = source.name;

    this.source = source.source;
    this.mipmaps = source.mipmaps.slice(0);

    this.mapping = source.mapping;
    this.channel = source.channel;

    this.wrapS = source.wrapS;
    this.wrapT = source.wrapT;

    this.magFilter = source.magFilter;
    this.minFilter = source.minFilter;

    this.anisotropy = source.anisotropy;

    this.format = source.format;
    this.internalFormat = source.internalFormat;
    this.type = source.type;

    this.offset.copy(source.offset);
    this.repeat.copy(source.repeat);
    this.center.copy(source.center);
    this.rotation = source.rotation;

    this.matrixAutoUpdate = source.matrixAutoUpdate;
    this.matrix.copy(source.matrix);

    this.generateMipmaps = source.generateMipmaps;
    this.premultiplyAlpha = source.premultiplyAlpha;
    this.flipY = source.flipY;
    this.unpackAlignment = source.unpackAlignment;
    this.colorSpace = source.colorSpace;

    this.userData = JSON.parse(JSON.stringify(source.userData));

    this.needsUpdate = true;

    return this;
  }

  dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }

  transformUv(uv: Vector2): Vector2 {
    if (this.mapping !== UVMapping) return uv;

    uv.applyMatrix3(this.matrix);

    if (uv.x < 0 || uv.x > 1) {
      switch (this.wrapS) {
        case RepeatWrapping:
          uv.x = uv.x - Math.floor(uv.x);
          break;

        case ClampToEdgeWrapping:
          uv.x = uv.x < 0 ? 0 : 1;
          break;

        case MirroredRepeatWrapping:
          if (Math.abs(Math.floor(uv.x) % 2) === 1) {
            uv.x = Math.ceil(uv.x) - uv.x;
          } else {
            uv.x = uv.x - Math.floor(uv.x);
          }

          break;
      }
    }

    if (uv.y < 0 || uv.y > 1) {
      switch (this.wrapT) {
        case RepeatWrapping:
          uv.y = uv.y - Math.floor(uv.y);
          break;

        case ClampToEdgeWrapping:
          uv.y = uv.y < 0 ? 0 : 1;
          break;

        case MirroredRepeatWrapping:
          if (Math.abs(Math.floor(uv.y) % 2) === 1) {
            uv.y = Math.ceil(uv.y) - uv.y;
          } else {
            uv.y = uv.y - Math.floor(uv.y);
          }

          break;
      }
    }

    if (this.flipY) {
      uv.y = 1 - uv.y;
    }

    return uv;
  }
}
