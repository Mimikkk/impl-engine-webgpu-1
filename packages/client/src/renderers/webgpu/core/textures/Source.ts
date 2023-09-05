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
