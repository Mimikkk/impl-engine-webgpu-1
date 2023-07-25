import { type AdapterOptions, createAdapter } from './createAdapter.js';
import { type DeviceOptions, createDevice } from './createDevice.js';
import type { Engine, Store } from './types.js';
import { createStore } from './createStore.js';
import { createBuffersState } from './buffers/createBuffersState.js';

export interface CreateOptions {
  adapter?: AdapterOptions;
  device?: DeviceOptions;
}

export const create = async (canvas: HTMLCanvasElement, options?: CreateOptions): Promise<Store<Engine>> => {
  if (!navigator.gpu) throw new Error('WebGPU is not supported');

  const adapter = await createAdapter(options?.adapter);
  const device = await createDevice(adapter, options?.device);
  const context = canvas.getContext('webgpu');

  if (!context) throw new Error('WebGPU is not supported');

  return createStore((set, get) => ({
    api: device,
    context: context,
    buffers: createBuffersState(set, get),
  }));
};
