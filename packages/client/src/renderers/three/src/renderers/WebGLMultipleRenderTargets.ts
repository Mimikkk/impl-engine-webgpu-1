import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { RenderTargetOptions } from '../core/RenderTarget.js';

export class WebGLMultipleRenderTargets extends WebGLRenderTarget {
  declare isWebGLMultipleRenderTargets: true;

  constructor(width: number = 1, height: number = 1, count: number = 1, options: RenderTargetOptions = {}) {
    super(width, height, options);

    const texture = this.texture;

    this.texture = [];

    for (let i = 0; i < count; i++) {
      this.texture[i] = texture.clone();
      this.texture[i].isRenderTargetTexture = true;
    }
  }

  setSize(width?: number, height?: number, depth: number = 1) {
    if (this.width !== width || this.height !== height || this.depth !== depth) {
      this.width = width;
      this.height = height;
      this.depth = depth;

      for (let i = 0, il = this.texture.length; i < il; i++) {
        this.texture[i].image.width = width;
        this.texture[i].image.height = height;
        this.texture[i].image.depth = depth;
      }

      this.dispose();
    }

    this.viewport.set(0, 0, width, height);
    this.scissor.set(0, 0, width, height);
  }

  copy(source: WebGLMultipleRenderTargets): this {
    this.dispose();

    this.width = source.width;
    this.height = source.height;
    this.depth = source.depth;

    this.scissor.copy(source.scissor);
    this.scissorTest = source.scissorTest;

    this.viewport.copy(source.viewport);

    this.depthBuffer = source.depthBuffer;
    this.stencilBuffer = source.stencilBuffer;

    if (source.depthTexture !== null) this.depthTexture = source.depthTexture.clone();

    this.texture.length = 0;

    for (let i = 0, il = source.texture.length; i < il; i++) {
      this.texture[i] = source.texture[i].clone();
      this.texture[i].isRenderTargetTexture = true;
    }

    return this;
  }
}
WebGLMultipleRenderTargets.prototype.isWebGLMultipleRenderTargets = true;
