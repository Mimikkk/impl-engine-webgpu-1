import { BufferGeometry } from './BufferGeometry.js';

export class InstancedBufferGeometry extends BufferGeometry {
  declare ['constructor']: new () => this;
  declare isInstancedBufferGeometry: true;
  declare type: string | 'InstancedBufferGeometry';
  instanceCount: number;

  constructor() {
    super();
    this.isInstancedBufferGeometry = true;
    this.type = 'InstancedBufferGeometry';
    this.instanceCount = Infinity;
  }

  copy(source: InstancedBufferGeometry): this {
    super.copy(source);
    this.instanceCount = source.instanceCount;
    return this;
  }
}
InstancedBufferGeometry.prototype.isInstancedBufferGeometry = true;
InstancedBufferGeometry.prototype.type = 'InstancedBufferGeometry';
