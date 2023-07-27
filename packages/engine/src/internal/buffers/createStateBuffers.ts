import { createStateBuffersVertex } from './createStateBuffersVertex.js';
import { createStateBuffersUniform } from './createStateBuffersUniform.js';
import { createStateBuffersIndex } from './createStateBuffersIndex.js';
import type { Store } from '../createStore.js';
import type { Buffers } from './types.js';

export const createStateBuffers: Store.Create<Buffers> = (set, get) => ({
  uniform: createStateBuffersUniform(set, get),
  vertex: createStateBuffersVertex(set, get),
  index: createStateBuffersIndex(set, get),
  read(item) {
    if (typeof item !== 'string') return item;

    const buffer = get().buffers.map.get(item);

    if (!buffer) throw new Error(`Buffer "${item}" does not exist.`);

    return buffer;
  },
  write(item, content) {
    const buffer = get().buffers.read(item);

    get().api.queue.writeBuffer(buffer, 0, content, 0, content.length);
  },
  remove(item) {
    const buffer = get().buffers.read(item);

    buffer.destroy();

    get().buffers.map.delete(buffer.label);
  },
  slots: new Map(),
  map: new Map(),
});
