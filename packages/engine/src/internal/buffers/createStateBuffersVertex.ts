import type { Store } from '../createStore.js';
import type { Buffers } from './types.js';

export const createStateBuffersVertex: Store.Create<Buffers['vertex']> = (set, get) => ({
  create: ({ name, content, capacity = content?.byteLength ?? 0 }) => {
    const { api, buffers } = get();
    const mapped = !!content;
    const buffer = api.createBuffer({
      label: name,
      size: capacity,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: mapped,
    });

    if (content) {
      //@ts-expect-error - contains a constructor
      new content.constructor(buffer.getMappedRange()).set(content);

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
