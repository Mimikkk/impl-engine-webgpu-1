import { Store } from '../createStore.js';
import { Shaders } from './types.js';

export const createStateShaders: Store.Create<Shaders> = (set, get) => ({
  create: ({ name, content, hints }) => {
    const {
      api,
      shaders: { map },
    } = get();

    const module = api.createShaderModule({ label: name, code: content, hints });

    map.set(module.label, module);

    return module;
  },
  read: item => {
    if (typeof item !== 'string') return item;

    const module = get().shaders.map.get(item);

    if (!module) throw Error(`Shader Module "${item}" does not exist.`);

    return module;
  },
  remove: item => {
    const module = get().shaders.read(item);

    get().shaders.map.delete(module.label);
  },
  map: new Map(),
});
