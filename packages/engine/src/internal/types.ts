import type { Buffers } from './buffers/types.js';

export interface Engine {
  api: GPUDevice;
  context: GPUCanvasContext;
  buffers: Buffers;
}

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
