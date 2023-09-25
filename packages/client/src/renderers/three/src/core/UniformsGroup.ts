import { EventDispatcher } from './EventDispatcher.js';
import { StaticDrawUsage, Usage } from '../constants.js';
import { Uniform } from './Uniform.js';

let id = 0;

export class UniformsGroup extends EventDispatcher<'dispose'> {
  declare ['constructor']: new () => this;
  declare isUniformsGroup: true;
  id: number;
  name: string;
  usage: number;
  uniforms: Uniform[];

  constructor() {
    super();

    this.isUniformsGroup = true;

    Object.defineProperty(this, 'id', { value: id++ });

    this.name = '';

    this.usage = StaticDrawUsage;
    this.uniforms = [];
  }

  add(uniform: Uniform): this {
    this.uniforms.push(uniform);

    return this;
  }

  remove(uniform: Uniform): this {
    const index = this.uniforms.indexOf(uniform);

    if (index !== -1) this.uniforms.splice(index, 1);

    return this;
  }

  setName(name: string): this {
    this.name = name;

    return this;
  }

  setUsage(value: Usage): this {
    this.usage = value;

    return this;
  }

  dispose(): this {
    this.dispatchEvent({ type: 'dispose' });
    return this;
  }

  copy(source: UniformsGroup): this {
    this.name = source.name;
    this.usage = source.usage;

    const uniformsSource = source.uniforms;

    this.uniforms.length = 0;

    for (let i = 0, l = uniformsSource.length; i < l; i++) {
      this.uniforms.push(uniformsSource[i].clone());
    }

    return this;
  }

  clone() {
    return new this.constructor().copy(this);
  }
}
