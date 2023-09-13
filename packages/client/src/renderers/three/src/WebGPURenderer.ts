import Renderer from './common/Renderer.js';
import WebGPUBackend from './WebGPUBackend.js';

export class WebGPURenderer extends Renderer {
  constructor(parameters = {}) {
    super(new WebGPUBackend(parameters));
    this.isWebGPURenderer = true;
  }
}

export default WebGPURenderer;
export const createRenderer = () => new WebGPURenderer();
