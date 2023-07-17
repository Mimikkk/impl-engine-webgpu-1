import { type AdapterOptions, createAdapter } from './createAdapter';
import { type DeviceOptions, createDevice } from './createDevice';

export interface CreateOptions {
  adapter?: AdapterOptions;
  device?: DeviceOptions;
}

export const create = async (options?: CreateOptions) => {
  if (!navigator.gpu) throw new Error('WebGPU is not supported');

  const adapter = await createAdapter(options?.adapter);
  const device = await createDevice(adapter, options?.device);

  return { api: device } as const;
};
