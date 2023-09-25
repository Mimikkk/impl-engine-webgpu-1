import { MathUtils } from '../math/MathUtils.js';

let sourceId = 0;

export class Source {
  declare isSource: boolean;
  declare id: number;
  declare uuid: string;
  declare data: null | TexImageSource | { width: number; height: number } | (HTMLImageElement | HTMLCanvasElement)[];
  declare version: number;

  constructor(
    data: TexImageSource | (HTMLImageElement | HTMLCanvasElement)[] | { width: number; height: number } | null = null,
  ) {
    this.isSource = true;

    Object.defineProperty(this, 'id', { value: sourceId++ });

    this.uuid = MathUtils.generateUUID();

    this.data = data;

    this.version = 0;
  }

  set needsUpdate(value: boolean) {
    if (value) this.version++;
  }
}
