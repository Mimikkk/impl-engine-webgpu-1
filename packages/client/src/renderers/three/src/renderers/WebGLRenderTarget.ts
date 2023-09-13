import { RenderTarget, RenderTargetOptions } from '../core/RenderTarget.js';

export class WebGLRenderTarget extends RenderTarget {
  declare isWebGLRenderTarget: true;

  constructor(width: number = 1, height: number = 1, options: RenderTargetOptions = {}) {
    super(width, height, options);
  }
}
WebGLRenderTarget.prototype.isWebGLRenderTarget = true;
