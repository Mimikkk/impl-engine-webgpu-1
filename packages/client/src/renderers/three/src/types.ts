export interface Cloneable {
  clone(...args: []): this;
}

export namespace Cloneable {
  export const is = (object: unknown): object is Cloneable => typeof object === 'object' && 'clone' in object!;
}

export interface Parseable {
  parse(...args: any[]): this;
}

export namespace Parseable {
  export const is = (object: unknown): object is Parseable => typeof object === 'object' && 'parse' in object!;
}

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

export type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

export type NumberArrayConstructor = TypedArrayConstructor | ArrayConstructor;
export type NumberArray = TypedArray | Array<number>;
