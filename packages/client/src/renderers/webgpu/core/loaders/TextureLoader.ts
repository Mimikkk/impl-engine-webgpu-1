import { ImageLoader } from './ImageLoader.js';
import { Texture } from '../textures/Texture.js';
import { Loader } from './Loader.js';
import { LoadingManager } from './LoadingManager.js';

export class TextureLoader extends Loader {
  constructor(manager: LoadingManager) {
    super(manager);
  }

  //@ts-expect-error
  load(url: string, { onLoad, onError, onProgress }: TextureLoader.Handlers = {}): Texture {
    const texture = new Texture();

    const loader = new ImageLoader(this.manager);
    loader.setCrossOrigin(this.crossOrigin);
    loader.setPath(this.path);

    loader.load(url, {
      onProgress,
      onError,
      onLoad: image => {
        texture.image = image;
        texture.needsUpdate = true;

        onLoad?.(texture);
      },
    });

    return texture;
  }
}

export namespace TextureLoader {
  export interface Handlers {
    onLoad?: (texture: Texture) => void;
    onProgress?: (event: ProgressEvent) => void;
    onError?: (event: ErrorEvent) => void;
  }
}
