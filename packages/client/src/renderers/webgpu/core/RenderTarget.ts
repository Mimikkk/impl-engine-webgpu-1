import { EventDispatcher } from './EventDispatcher.js';
import { Texture } from './textures/Texture.js';
import { LinearFilter } from '../common/Constants.js';
import { Vector4 } from './Vector4.js';
import { Source } from './textures/Source.js';
import { DepthTexture } from './textures/DepthTexture.js';

interface Options {
  mapping?: number;
  wrapS?: number;
  wrapT?: number;
  magFilter?: number;
  minFilter?: number;
  format?: number;
  type?: number;
  anisotropy?: number;
  colorSpace?: string;
  generateMipmaps?: boolean;
  internalFormat?: number;
  depthBuffer?: boolean;
  stencilBuffer?: boolean;
  depthTexture?: DepthTexture;
  samples?: number;
}

export class RenderTarget extends EventDispatcher {
  isRenderTarget: boolean;
  width: number;
  height: number;
  depth: number;
  scissor: Vector4;
  scissorTest: boolean;
  viewport: Vector4;
  texture: Texture;
  depthBuffer: any;
  stencilBuffer: any;
  depthTexture: DepthTexture | null;
  samples: number;

  constructor(width: number = 1, height: number = 1, options: Options = {}) {
    super();

    this.isRenderTarget = true;

    this.width = width;
    this.height = height;
    this.depth = 1;

    this.scissor = new Vector4(0, 0, width, height);
    this.scissorTest = false;

    this.viewport = new Vector4(0, 0, width, height);

    const image = { width: width, height: height, depth: 1 } as any;

    this.texture = new Texture(
      image,
      options.mapping,
      options.wrapS,
      options.wrapT,
      options.magFilter,
      options.minFilter,
      options.format,
      options.type,
      options.anisotropy,
      options.colorSpace,
    );
    this.texture.isRenderTargetTexture = true;

    this.texture.flipY = false;
    this.texture.generateMipmaps = options?.generateMipmaps ?? false;
    this.texture.internalFormat = options?.internalFormat ?? null;
    this.texture.minFilter = options?.minFilter ?? LinearFilter;

    this.depthBuffer = options?.depthBuffer ?? true;
    this.stencilBuffer = options?.stencilBuffer ?? false;
    this.depthTexture = options?.depthTexture ?? null;
    this.samples = options?.samples ?? 0;
  }

  setSize(width: number, height: number, depth: number = 1) {
    if (this.width !== width || this.height !== height || this.depth !== depth) {
      this.width = width;
      this.height = height;
      this.depth = depth;

      this.texture.image.width = width;
      this.texture.image.height = height;
      this.texture.image.depth = depth;

      this.dispose();
    }

    this.viewport.set(0, 0, width, height);
    this.scissor.set(0, 0, width, height);
  }

  clone() {
    return new RenderTarget().copy(this);
  }

  copy(source: RenderTarget) {
    this.width = source.width;
    this.height = source.height;
    this.depth = source.depth;
    this.scissor.copy(source.scissor);
    this.scissorTest = source.scissorTest;
    this.viewport.copy(source.viewport);
    this.texture = source.texture.clone();
    this.texture.isRenderTargetTexture = true;

    const image = structuredClone(source.texture.image);
    this.texture.source = new Source(image);
    this.depthBuffer = source.depthBuffer;
    this.stencilBuffer = source.stencilBuffer;
    if (source.depthTexture) this.depthTexture = source.depthTexture.clone() as DepthTexture;
    this.samples = source.samples;

    return this;
  }

  dispose() {
    this.dispatchEvent({ target: null, type: 'dispose' });
  }
}
