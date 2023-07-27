import type { TypeArray } from './typeArray.js';

export namespace base64 {
  export const encode = async (bytes: BlobPart, type = 'application/octet-stream') =>
    await new Promise((resolve, reject) => {
      const reader = Object.assign(new FileReader(), {
        onload: () => resolve(reader.result),
        onerror: () => reject(reader.error),
      });

      reader.readAsDataURL(new File([bytes], '', { type }));
    });

  export const decode = async <T = ArrayBuffer>(url: string, type?: new (buffer: ArrayBuffer) => T): Promise<T> => {
    const result = await fetch(url);
    const buffer = await result.arrayBuffer();

    return (!type ? buffer : new type(buffer)) as T;
  };
}
