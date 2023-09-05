import { Cache } from './Cache.js';
import { Loader } from './Loader.js';
import { LoadingManager } from './LoadingManager.js';

class ImageBitmapLoader extends Loader {
  isImageBitmapLoader: boolean = true;
  options: ImageBitmapLoader.Options = { premultiplyAlpha: 'none', colorSpaceConversion: 'none' };

  constructor(manager: LoadingManager) {
    super(manager);
  }

  setOptions(options: ImageBitmapLoader.Options): ImageBitmapLoader {
    this.options = options;
    return this;
  }

  //@ts-expect-error
  load(url: string = '', handlers: ImageBitmapLoader.Handlers = {}) {
    if (this.path) url = this.path + url;

    url = this.manager.resolveURL(url);

    const cached = Cache.get<ImageBitmap>(url);
    if (cached) {
      this.manager.itemStart(url);

      setTimeout(() => {
        handlers.onLoad?.(cached);
        this.manager.itemEnd(url);
      }, 0);

      return cached;
    }

    fetch(url, {
      credentials: this.crossOrigin === 'anonymous' ? 'same-origin' : 'include',
      headers: this.requestHeader,
    })
      .then(res => res.blob())
      .then(blob => createImageBitmap(blob, this.options))
      .then(bitmap => {
        Cache.add(url, bitmap);
        handlers.onLoad?.(bitmap);
        this.manager.itemEnd(url);
      })
      .catch(error => {
        handlers.onError?.(error);
        this.manager.itemError(url);
        this.manager.itemEnd(url);
      });

    this.manager.itemStart(url);
  }
}
namespace ImageBitmapLoader {
  export interface Options {
    premultiplyAlpha: PremultiplyAlpha;
    colorSpaceConversion: ColorSpaceConversion;
  }

  export interface Handlers {
    onLoad?: (bitmap: ImageBitmap) => void;
    onProgress?: (url: string, loaded: number, total: number) => void;
    onError?: (error: ErrorEvent) => void;
  }
}

export { ImageBitmapLoader };
