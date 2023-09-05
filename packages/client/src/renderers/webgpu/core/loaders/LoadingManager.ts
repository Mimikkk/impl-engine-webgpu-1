import { Loader } from 'three/src/loaders/Loader.js';

export class LoadingManager {
  onProgress?: LoadingManager.ProgressFn;
  onStart?: LoadingManager.StartFn;
  onError?: LoadingManager.ErrorFn;
  onLoad?: LoadingManager.LoadFn;

  handlers: (RegExp | Loader)[] = [];
  modifyUrl?: (url: string) => string;
  isLoading: boolean = false;
  itemsLoaded: number = 0;
  itemsTotal: number = 0;

  constructor({ onStart, onLoad, onError, onProgress }: LoadingManager.Handlers = {}) {
    this.onStart = onStart;
    this.onLoad = onLoad;
    this.onProgress = onProgress;
    this.onError = onError;
  }

  addHandler(regex: RegExp, loader: Loader): LoadingManager {
    this.handlers.push(regex, loader);
    return this;
  }
  removeHandler(regex: RegExp): LoadingManager {
    const index = this.handlers.indexOf(regex);
    if (index !== -1) this.handlers.splice(index, 2);
    return this;
  }
  getHandler(file: string): Loader | null {
    for (let i = 0, l = this.handlers.length; i < l; i += 2) {
      const regex = this.handlers[i] as RegExp;
      const loader = this.handlers[i + 1] as Loader;

      // see #17920
      if (regex.global) regex.lastIndex = 0;
      if (regex.test(file)) return loader;
    }
    return null;
  }
  setURLModifier(callback?: (url: string) => string): LoadingManager {
    this.modifyUrl = callback;
    return this;
  }
  resolveURL: (url: string) => string = url => this.modifyUrl?.(url) ?? url;

  itemStart(url: string): void {
    ++this.itemsTotal;

    if (!this.isLoading) this.onStart?.(url, this.itemsLoaded, this.itemsTotal);
    this.isLoading = true;
  }
  itemEnd(url: string): void {
    this.itemsLoaded++;

    this.onProgress?.(url, this.itemsLoaded, this.itemsTotal);

    if (this.itemsLoaded === this.itemsTotal) {
      this.isLoading = false;
      this.onLoad?.();
    }
  }
  itemError(url: string): void {
    this.onError?.(url);
  }
}

export namespace LoadingManager {
  export type LoadFn = () => void;
  export type ProgressFn = (url: string, loaded: number, total: number) => void;
  export type ErrorFn = (url: string) => void;
  export type StartFn = ProgressFn;

  export interface Handlers {
    onLoad?: LoadFn;
    onProgress?: ProgressFn;
    onError?: ErrorFn;
    onStart?: StartFn;
  }
}

export default new LoadingManager();
