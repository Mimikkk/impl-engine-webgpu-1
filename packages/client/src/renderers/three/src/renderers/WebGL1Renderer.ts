import { WebGLRenderer } from './WebGLRenderer.js';

export class WebGL1Renderer extends WebGLRenderer {
  declare isWebGL1Renderer: true;
}

WebGL1Renderer.prototype.isWebGL1Renderer = true;
