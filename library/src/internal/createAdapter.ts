export interface AdapterOptions extends GPURequestAdapterOptions {}

export const createAdapter = async (options: AdapterOptions = {}): Promise<GPUAdapter> => {
  const adapter = await navigator.gpu.requestAdapter(options);

  if (!adapter) throw Error('Could not request WebGPU adapter.');

  return adapter;
}
