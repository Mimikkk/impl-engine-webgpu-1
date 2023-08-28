import { EventDispatcher } from '../EventDispatcher.js';
import {
  ClampToEdgeWrapping,
  LinearEncoding,
  LinearFilter,
  LinearMipmapLinearFilter,
  MirroredRepeatWrapping,
  NoColorSpace,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  sRGBEncoding,
  UnsignedByteType,
  UVMapping,
} from '../../common/Constants.js';
import * as MathUtils from '../MathUtils.js';
import { Vector2 } from '../Vector2.js';
import { Matrix3 } from '../Matrix3.js';
import { Source } from './Source.js';
import { warnOnce } from '../utils.js';

let textureId = 0;

export class Texture extends EventDispatcher {
  static DEFAULT_IMAGE: null;
  static DEFAULT_MAPPING: number;
  static DEFAULT_ANISOTROPY: number;
  isTexture: boolean;
  uuid: string;
  name: string;
  source: Source;
  mipmaps: never[];
  mapping: number;
  channel: number;
  wrapS: number;
  magFilter: number;
  minFilter: number;
  wrapT: number;
  anisotropy: number;
  internalFormat: number | null;
  format: number;
  type: number;
  offset: Vector2;
  repeat: Vector2;
  center: Vector2;
  rotation: number;
  matrixAutoUpdate: boolean;
  matrix: Matrix3;
  generateMipmaps: boolean;
  premultiplyAlpha: boolean;
  unpackAlignment: number;
  flipY: boolean;
  colorSpace: string;
  userData: {};
  version: number;
  onUpdate: null;
  isRenderTargetTexture: boolean;
  needsPMREMUpdate: boolean;

  constructor(
    image: null = Texture.DEFAULT_IMAGE,
    mapping: number = Texture.DEFAULT_MAPPING,
    wrapS: number = ClampToEdgeWrapping,
    wrapT: number = ClampToEdgeWrapping,
    magFilter: number = LinearFilter,
    minFilter: number = LinearMipmapLinearFilter,
    format: number = RGBAFormat,
    type: number = UnsignedByteType,
    anisotropy: number = Texture.DEFAULT_ANISOTROPY,
    colorSpace: string = NoColorSpace,
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

    // indicates whether a texture belongs to a render target or not
    this.isRenderTargetTexture = false;
    // indicates whether this texture should be processed by PMREMGenerator or not (only relevant for render target textures)
    this.needsPMREMUpdate = false;
  }

  get image() {
    return this.source.data;
  }

  set image(value) {
    this.source.data = value;
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

  clone() {
    return new Texture().copy(this);
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

  toJSON(meta: any) {
    const isRootObject = meta === undefined || typeof meta === 'string';

    if (!isRootObject && meta.textures[this.uuid] !== undefined) {
      return meta.textures[this.uuid];
    }

    const output = {
      userData: {},
      metadata: {
        version: 4.6,
        type: 'Texture',
        generator: 'Texture.toJSON',
      },

      uuid: this.uuid,
      name: this.name,

      image: this.source.toJSON(meta).uuid,

      mapping: this.mapping,
      channel: this.channel,

      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,

      wrap: [this.wrapS, this.wrapT],

      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,

      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,

      flipY: this.flipY,

      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment,
    };

    if (Object.keys(this.userData).length > 0) output.userData = this.userData;

    if (!isRootObject) {
      meta.textures[this.uuid] = output;
    }

    return output;
  }

  dispose() {
    this.dispatchEvent({ type: 'dispose', target: null });
  }

  transformUv(uv: Vector2) {
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
}

Texture.DEFAULT_IMAGE = null;
Texture.DEFAULT_MAPPING = UVMapping;
Texture.DEFAULT_ANISOTROPY = 1;
