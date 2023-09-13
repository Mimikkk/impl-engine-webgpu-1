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
