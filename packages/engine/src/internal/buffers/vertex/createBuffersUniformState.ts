import type { Engine, Store } from '../../types.js';

export const createBuffersUniformState: Store.Create<Engine['buffers']['uniform']> = (set, get) => ({
  create: ({ name, content, capacity = content?.byteLength ?? 0 }) => {
    const { api, buffers } = get();
    const mapped = !!content;
    const buffer = api.createBuffer({
      label: name,
      size: capacity,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: mapped,
    });

    if (content) {
      api.queue.writeBuffer(buffer, 0, content, 0, content.length);
      buffer.unmap();
    }

    buffers.map.set(name, buffer);

    return buffer;
  },
  write: get().buffers.write,
});
