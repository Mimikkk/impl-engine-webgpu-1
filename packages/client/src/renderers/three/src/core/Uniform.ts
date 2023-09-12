import { Cloneable } from '../types.js';

export class Uniform<T = any> {
  declare ['constructor']: new (value: T) => this;
  declare value: T;

  constructor(value: T) {
    this.value = value;
  }

  clone() {
    return new this.constructor(Cloneable.is(this.value) ? this.value.clone() : this.value);
  }
}
