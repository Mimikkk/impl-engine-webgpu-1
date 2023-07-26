import type { Engine, Store } from '../../types.js';

export const createBuffersVertexState: Store.Create<Engine['buffers']['vertex']> = (set, get) => ({
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
      api.queue.writeBuffer(buffer, 0, content, 0, content.length);
      buffer.unmap();
    }

    buffers.map.set(name, buffer);

    return buffer;
  },
  write: get().buffers.write,
  slots: {
    toggle(item, at = get().buffers.vertex.slots.next) {
      const {
        buffers: { vertex },
        buffers,
        api,
      } = get();
      const buffer = buffers.read(item);

      const { max, map } = vertex.slots;

      if (at > max)
        throw Error(
          `Cannot toggle Vertex Buffer to a slot at an index ${at} greater than the max index slot of ${max}.`,
        );
      if (at < 0) throw Error(`Cannot toggle Vertex Buffer to a negative index slot ${at}.`);

      // toggle here
      if (map.has(at)) {
        map.delete(at);
      } else {
        map.set(at, buffer);
      }
    },
    get max() {
      return get().api.limits.maxVertexBuffers;
    },
    get next() {
      const { max, map } = get().buffers.vertex.slots;
      const next = map.size;

      if (next === max) throw new Error(`Max Vertex Buffer slots of ${max} achieved. No more slots available.`);

      return next;
    },
    map: new Map(),
  },
});
