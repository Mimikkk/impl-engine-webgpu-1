import { type AdapterOptions, createAdapter } from './createAdapter.js';
import { type DeviceOptions, createDevice } from './createDevice.js';
import type { Engine } from './types.js';
import { createStore, type Store } from './createStore.js';
import { createStateBuffers } from './buffers/createStateBuffers.js';
import { createStateShaders } from './shaders/createStateShaders.js';
import { createStateSlots } from './slots/createStateSlots.js';

export interface CreateOptions {
  adapter?: AdapterOptions;
  device?: DeviceOptions;
}

export const createEngine = async (canvas: HTMLCanvasElement, options?: CreateOptions): Promise<Store<Engine>> => {
  if (!navigator.gpu) throw new Error('WebGPU is not supported');

  const adapter = await createAdapter(options?.adapter);
  const device = await createDevice(adapter, options?.device);
  const context = canvas.getContext('webgpu');

  if (!context) throw new Error('WebGPU is not supported');

  const reset = ({ mode = 'premultiplied' }: Engine.ResetOptions = {}) => {
    context.unconfigure();
    context.configure({
      device,
      format: navigator.gpu.getPreferredCanvasFormat(),
      alphaMode: mode,
      colorSpace: 'display-p3',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });
  };
  reset();

  return createStore((set, get) => ({
    api: device,
    context: context,
    reset,
    buffers: createStateBuffers(set, get),
    shaders: createStateShaders(set, get),
    slots: createStateSlots(set, get),
  }));
};
