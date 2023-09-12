export class GLBufferAttribute {
  declare isGLBufferAttribute: true;
  name: string;
  buffer: WebGLBuffer;
  type: GLenum;
  itemSize: number;
  elementSize: 1 | 2 | 4;
  count: number;
  version: number;

  constructor(buffer: WebGLBuffer, type: GLenum, itemSize: number, elementSize: 1 | 2 | 4, count: number) {
    this.name = '';

    this.buffer = buffer;
    this.type = type;
    this.itemSize = itemSize;
    this.elementSize = elementSize;
    this.count = count;

    this.version = 0;
  }

  set needsUpdate(value: boolean) {
    if (value) this.version++;
  }

  setBuffer(buffer: WebGLBuffer): this {
    this.buffer = buffer;

    return this;
  }

  setType(type: GLenum, elementSize: 1 | 2 | 4): this {
    this.type = type;
    this.elementSize = elementSize;

    return this;
  }

  setItemSize(itemSize: number): this {
    this.itemSize = itemSize;

    return this;
  }

  setCount(count: number): this {
    this.count = count;

    return this;
  }
}
GLBufferAttribute.prototype.isGLBufferAttribute = true;
