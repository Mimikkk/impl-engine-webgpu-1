import type { Store } from '../createStore.js';
import type { Buffers } from './types.js';

export const createStateBuffersIndex: Store.Create<Buffers['index']> = (set, get) => ({
  create: ({ name, content, capacity = content?.byteLength ?? 0 }) => {
    const { api, buffers } = get();
    const mapped = !!content;
    const buffer = api.createBuffer({
      label: name,
      size: capacity,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: mapped,
    });

    if (content) {
      api.queue.writeBuffer(buffer, 0, content, 0, content.length);
      buffer.unmap();
    }

    buffers.map.set(name, buffer);

    return buffer;
  },
  write(item, content) {
    const buffer = get().buffers.read(item);

    get().api.queue.writeBuffer(buffer, 0, content, 0, content.length);
  },
});
