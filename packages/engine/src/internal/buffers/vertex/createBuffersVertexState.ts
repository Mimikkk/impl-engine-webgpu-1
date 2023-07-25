import { Buffers, CreateBufferOptions, Engine, Store } from '../../types.js';

export const createBuffersVertexState: Store.Create<Engine['buffers']['vertex']> = (set, get) => ({
  create: ({ name, capacity = 0 }: CreateBufferOptions) => {
    const vertices = new Float32Array([
      0.0, 0.6, 0, 1, 1, 0, 0, 1, -0.5, -0.6, 0, 1, 0, 1, 0, 1, 0.5, -0.6, 0, 1, 0, 0, 1, 1,
    ]);
    const { api, buffers } = get();
    const buffer = api.createBuffer({
      label: 'vertex-buffer',
      size: capacity,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false,
    });

    buffers.map.set(name, buffer);

    api.queue.writeBuffer(buffer, 0, vertices, 0, vertices.length);

    return buffer;
  },
});
