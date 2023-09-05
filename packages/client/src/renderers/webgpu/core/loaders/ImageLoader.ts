import { Cache } from './Cache.js';
import { Loader } from './Loader.js';
import { LoadingManager } from './LoadingManager.js';

export class ImageLoader extends Loader {
  constructor(manager: LoadingManager) {
    super(manager);
  }

  //@ts-expect-error
  load(url: string, handlers: ImageLoader.Handlers = {}): HTMLImageElement {
    if (this.path) url = this.path + url;
    url = this.manager.resolveURL(url);

    const cached = Cache.get<HTMLImageElement>(url);

    if (cached) {
      this.manager.itemStart(url);

      setTimeout(() => {
        handlers.onLoad?.(cached);

        this.manager.itemEnd(url);
      }, 0);

      return cached;
    }

    const image = document.createElement('img');

    const onLoad = () => {
      image.removeEventListener('load', onLoad);
      image.removeEventListener('error', onError);

      Cache.add(url, image);
      handlers.onLoad?.(image);

      this.manager.itemEnd(url);
    };
    const onError = (event: ErrorEvent) => {
      image.removeEventListener('load', onLoad);
      image.removeEventListener('error', onError);

      handlers.onError?.(event);

      this.manager.itemError(url);
      this.manager.itemEnd(url);
    };
    image.addEventListener('load', onLoad);
    image.addEventListener('error', onError);

    if (url.slice(0, 5) !== 'data:' && this.crossOrigin) image.crossOrigin = this.crossOrigin;

    this.manager.itemStart(url);
    image.src = url;

    return image;
  }
}

export namespace ImageLoader {
  export interface Handlers {
    onLoad?: (image: HTMLImageElement) => void;
    onProgress?: (event: ProgressEvent) => void;
    onError?: (event: ErrorEvent) => void;
  }
}
