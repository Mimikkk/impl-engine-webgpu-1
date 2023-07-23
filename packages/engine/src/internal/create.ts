import { type AdapterOptions, createAdapter } from './createAdapter.js';
import { type DeviceOptions, createDevice } from './createDevice.js';

export interface CreateOptions {
  adapter?: AdapterOptions;
  device?: DeviceOptions;
}

export interface CreateReturn {
  api: GPUDevice;
  context: GPUCanvasContext;
}

export const create = async (canvas: HTMLCanvasElement, options?: CreateOptions): Promise<CreateReturn> => {
  if (!navigator.gpu) throw new Error('WebGPU is not supported');

  const adapter = await createAdapter(options?.adapter);
  const device = await createDevice(adapter, options?.device);
  const context = canvas.getContext('webgpu');

  if (!context) throw new Error('WebGPU is not supported');

  return { api: device, context } as const;
};
