import type { Buffers } from './buffers/types.js';
import type { Shaders } from './shaders/types.js';
import type { Slots } from './slots/types.js';

export interface Engine {
  api: GPUDevice;
  context: GPUCanvasContext;
  reset: (options?: Engine.ResetOptions) => void;
  shaders: Shaders;
  buffers: Buffers;
  slots: Slots;
}

export namespace Engine {
  export interface ResetOptions {
    mode?: GPUCanvasConfiguration['alphaMode'];
  }
}
