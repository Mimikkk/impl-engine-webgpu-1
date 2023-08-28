import { SRGBToLinear } from './ColorManagement.js';

let _canvas: HTMLCanvasElement;
export namespace ImageUtils {
  export const getDataURL = (image: HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData) => {
    if ('src' in image && /^data:/i.test(image.src)) {
      return image.src;
    }

    let canvas;
    if (image instanceof HTMLCanvasElement) {
      canvas = image;
    } else {
      if (!_canvas) _canvas = document.createElement('canvas');

      _canvas.width = image.width;
      _canvas.height = image.height;

      const context = _canvas.getContext('2d')!;

      if (image instanceof ImageData) context.putImageData(image, 0, 0);
      else context.drawImage(image, 0, 0, image.width, image.height);

      canvas = _canvas;
    }

    if (canvas.width > 2048 || canvas.height > 2048) {
      console.warn('THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons', image);
      return canvas.toDataURL('image/jpeg', 0.6);
    }

    return canvas.toDataURL('image/png');
  };

  export const sRGBToLinear = (image: HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData) => {
    const { width, height } = image;

    if ('data' in image) {
      const data = image.data.slice(0);

      for (let i = 0; i < data.length; i++) {
        data[i] = Math.floor(SRGBToLinear(data[i] / 255) * 255);
      }

      return { data, width, height };
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i++) data[i] = SRGBToLinear(data[i] / 255) * 255;
    context.putImageData(imageData, 0, 0);

    return canvas;
  };
}
