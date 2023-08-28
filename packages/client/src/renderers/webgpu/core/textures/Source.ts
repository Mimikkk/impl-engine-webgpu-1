import { ImageUtils } from '../ImageUtils.js';
import { MathUtils } from '../MathUtils.js';

let sourceId = 0;

export class Source {
  data: any;
  isSource: boolean;
  uuid: string;
  version: number;

  constructor(data = null) {
    this.isSource = true;

    Object.defineProperty(this, 'id', { value: sourceId++ });

    this.uuid = MathUtils.generateUUID();

    this.data = data;

    this.version = 0;
  }

  set needsUpdate(value: boolean) {
    if (value === true) this.version++;
  }

  toJSON(meta: any) {
    const isRootObject = meta === undefined || typeof meta === 'string';

    if (!isRootObject && meta.images[this.uuid] !== undefined) {
      return meta.images[this.uuid];
    }

    const output = {
      uuid: this.uuid,
      url: '',
    };

    const data = this.data;

    if (data !== null) {
      let url;

      if (Array.isArray(data)) {
        // cube texture

        url = [];

        for (let i = 0, l = data.length; i < l; i++) {
          if (data[i].isDataTexture) {
            url.push(serializeImage(data[i].image));
          } else {
            url.push(serializeImage(data[i]));
          }
        }
      } else {
        // texture

        url = serializeImage(data);
      }

      output.url = url as any;
    }

    if (!isRootObject) {
      meta.images[this.uuid] = output;
    }

    return output;
  }
}

function serializeImage(image: HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData) {
  if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement || image instanceof ImageBitmap) {
    return ImageUtils.getDataURL(image);
  } else {
    if (image.data) {
      return {
        data: Array.from(image.data),
        width: image.width,
        height: image.height,
        type: image.data.constructor.name,
      };
    }
    console.warn('THREE.Texture: Unable to serialize Texture.');
    return {};
  }
}
