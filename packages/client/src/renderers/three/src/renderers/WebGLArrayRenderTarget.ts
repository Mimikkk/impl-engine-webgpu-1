import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { DataArrayTexture } from '../textures/DataArrayTexture.js';

export class WebGLArrayRenderTarget extends WebGLRenderTarget {
  declare isWebGLArrayRenderTarget: true;
  depth: number;
  texture: DataArrayTexture;

  constructor(width: number = 1, height: number = 1, depth: number = 1) {
    super(width, height);
    this.depth = depth;
    this.texture = new DataArrayTexture(null, width, height, depth);
    this.texture.isRenderTargetTexture = true;
  }
}
WebGLArrayRenderTarget.prototype.isWebGLArrayRenderTarget = true;
