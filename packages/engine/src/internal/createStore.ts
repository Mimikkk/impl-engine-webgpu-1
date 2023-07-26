import type { Store } from './types.js';

export const createStore = <T>(initialize: Store.Create<T, T>): Store<T> => {
  const listeners = new Set<Store.Update<T>>();

  const api: Store<T> = {
    set: updater => {
      const update = updater instanceof Function ? updater(state) : updater;

      if (Object.is(update, state)) return;

      const previous = state;
      state = typeof update === 'object' ? Object.assign({}, state, update) : update;

      listeners.forEach(listener => listener(state, previous));
    },
    get: () => state,
    subscribe: listener => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
  let state = initialize(api.set, api.get);

  return api;
};
