import type { Engine } from './types.js';

export interface Store<T = Engine> {
  set: Store.Set<T>;
  get: Store.Get<T>;
  subscribe: Store.Subscribe<T>;
}
export namespace Store {
  export type Update<T> = (a: T, b: T) => void;

  export type Subscribe<T> = (update: Update<T>) => Unsubscribe;
  export type Unsubscribe = () => void;

  export type Get<T> = () => T;
  export type Set<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void;

  export type Create<Y, T = Engine> = (set: Store.Set<T>, get: Store.Get<T>) => Y;
}

export const createStore = <T>(create: Store.Create<T, T>): Store<T> => {
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
  let state = create(api.set, api.get);

  return api;
};
