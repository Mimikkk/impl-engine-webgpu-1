import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { Data3DTexture } from '../textures/Data3DTexture.js';

export class WebGL3DRenderTarget extends WebGLRenderTarget {
  declare isWebGL3DRenderTarget: true;
  depth: number;
  texture: Data3DTexture;

  constructor(width: number = 1, height: number = 1, depth: number = 1) {
    super(width, height);

    this.depth = depth;

    this.texture = new Data3DTexture(null, width, height, depth);

    this.texture.isRenderTargetTexture = true;
  }
}
WebGL3DRenderTarget.prototype.isWebGL3DRenderTarget = true;
