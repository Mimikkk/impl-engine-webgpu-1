import type { Slots } from './types.js';
import type { Store } from '../createStore.js';

export const createStateSlots: Store.Create<Slots> = (set, get) => {
  return {
    toggleAt(item, at, index = get().slots.next) {
      const buffer = get().buffers.read(item);
      const { max, map } = get().slots;

      if (index > max)
        throw Error(
          `Cannot toggle Vertex Buffer to a slot at an index ${index} greater than the max index slot of ${max}.`,
        );
      if (index < 0) throw Error(`Cannot toggle Vertex Buffer to a negative index slot ${index}.`);

      // toggle here
      if (map.has(index)) {
        map.delete(index);
      } else {
        map.set(index, buffer);
      }
    },
    get max() {
      return get().api.limits.maxVertexBuffers;
    },
    get next() {
      const { max, map } = get().slots;
      const next = map.size;

      if (next === max) throw new Error(`Max Vertex Buffer slots of ${max} achieved. No more slots available.`);

      return next;
    },
    map: new Map(),
  };
};
