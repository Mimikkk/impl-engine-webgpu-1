import { Buffers, Engine, Store } from '../types.js';
import { createBuffersVertexState } from './vertex/createBuffersVertexState.js';

export const createBuffersState: Store.Create<Engine['buffers']> = (set, get) => {
  return {
    vertex: createBuffersVertexState(set, get),
    write: () => {},
    map: new Map(),
  };
};
