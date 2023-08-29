import { EventDispatcher } from './EventDispatcher.js';
import { StaticDrawUsage } from '../common/Constants.js';
import { Uniform } from './Uniform.js';

let id = 0;

export class UniformsGroup extends EventDispatcher {
  isUniformsGroup: boolean;
  name: string;
  id: number;
  usage: number;
  uniforms: Uniform[];

  constructor() {
    super();

    this.isUniformsGroup = true;

    this.id = id++;
    this.name = '';
    this.usage = StaticDrawUsage;
    this.uniforms = [];
  }

  add(uniform: Uniform) {
    this.uniforms.push(uniform);

    return this;
  }

  remove(uniform: Uniform) {
    const index = this.uniforms.indexOf(uniform);

    if (index !== -1) this.uniforms.splice(index, 1);

    return this;
  }

  setName(name: string) {
    this.name = name;

    return this;
  }

  setUsage(value: number) {
    this.usage = value;

    return this;
  }

  dispose() {
    this.dispatchEvent({ target: null, type: 'dispose' });
    return this;
  }

  copy(source: UniformsGroup) {
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
    return new UniformsGroup().copy(this);
  }
}
