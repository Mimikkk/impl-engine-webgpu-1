import Buffer from './Buffer.js';

export class UniformBuffer extends Buffer {
  constructor(name, buffer = null) {
    super(name, buffer);

    this.isUniformBuffer = true;
  }
}
