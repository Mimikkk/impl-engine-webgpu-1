export const arrayMin = (array: number[]) => {
  let min = array[0] ?? Infinity;
  for (let i = 1, l = array.length; i < l; ++i) if (array[i] < min) min = array[i];
  return min;
};

export const arrayMax = (array: number[]) => {
  let max = array[0] ?? -Infinity;
  for (let i = 1, l = array.length; i < l; ++i) if (array[i] > max) max = array[i];
  return max;
};

export const arrayNeedsUint32 = (array: number[]) => {
  for (let i = array.length - 1; i >= 0; --i) if (array[i] >= 65535) return true;
  return false;
};

const TYPED_ARRAYS = {
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
} as const;

export const getTypedArray = (type: keyof typeof TYPED_ARRAYS, buffer: number[]) => new TYPED_ARRAYS[type](buffer);

export const createElementNS = (name: string) => document.createElementNS('http://www.w3.org/1999/xhtml', name);

const cache: Set<string> = new Set();
export const warnOnce = (message: string) => {
  if (cache.has(message)) return;
  cache.add(message);
  console.warn(message);
};
