import type { LoadingManager } from './LoadingManager.js';
import DefaultLoadingManager from './LoadingManager.js';

export class Loader {
  manager: LoadingManager;
  crossOrigin: string;
  withCredentials: boolean;
  path: string;
  resourcePath: string;
  requestHeader: {};
  static DEFAULT_MATERIAL_NAME: string = '__DEFAULT';

  constructor(manager: LoadingManager) {
    this.manager = manager ?? DefaultLoadingManager;

    this.crossOrigin = 'anonymous';
    this.withCredentials = false;
    this.path = '';
    this.resourcePath = '';
    this.requestHeader = {};
  }

  load(url: string, handlers: LoadingManager.Handlers = {}) {}

  loadAsync(url: string, handlers: LoadingManager.Handlers = {}) {
    return new Promise((resolve, reject) =>
      this.load(url, {
        onStart: handlers.onStart,
        onProgress: handlers.onProgress,
        onLoad: () => {
          handlers.onLoad?.();
          resolve(undefined);
        },
        onError: url => {
          handlers.onError?.(url);
          reject(undefined);
        },
      }),
    );
  }

  parse(data: any) {}

  setCrossOrigin(crossOrigin: string) {
    this.crossOrigin = crossOrigin;
    return this;
  }

  setWithCredentials(value: boolean) {
    this.withCredentials = value;
    return this;
  }

  setPath(path: string) {
    this.path = path;
    return this;
  }

  setResourcePath(resourcePath: string) {
    this.resourcePath = resourcePath;
    return this;
  }

  setRequestHeader(requestHeader: string) {
    this.requestHeader = requestHeader;
    return this;
  }
}
