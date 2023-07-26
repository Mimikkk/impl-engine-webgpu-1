import type { Engine, Store } from '../types.js';
import { createBuffersVertexState } from './vertex/createBuffersVertexState.js';
import { createBuffersUniformState } from './vertex/createBuffersUniformState.js';
import { createBuffersIndexState } from './vertex/createBuffersIndexState.js';

export const createBuffersState: Store.Create<Engine['buffers']> = (set, get) => ({
  uniform: createBuffersUniformState(set, get),
  vertex: createBuffersVertexState(set, get),
  index: createBuffersIndexState(set, get),
  read(item) {
    if (typeof item !== 'string') return item;

    const buffer = get().buffers.map.get(item);
    if (!buffer) {
      throw new Error(`Buffer "${item}" does not exist.`);
    }
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
