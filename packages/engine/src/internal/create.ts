import { type AdapterOptions, createAdapter } from './createAdapter';
import { type DeviceOptions, createDevice } from './createDevice';

export interface CreateOptions {
  adapter?: AdapterOptions;
  device?: DeviceOptions;
}

export const create = async (canvas: HTMLCanvasElement, options?: CreateOptions) => {
  if (!navigator.gpu) throw new Error('WebGPU is not supported');

  const adapter = await createAdapter(options?.adapter);
  const device = await createDevice(adapter, options?.device);
  const context = canvas.getContext('webgpu');

  if (!context) throw new Error('WebGPU is not supported');

  return { api: device, context } as const;
};
