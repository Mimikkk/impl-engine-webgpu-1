import Binding from './Binding.js';
import { Texture } from '../textures/Texture.js';

export class Sampler extends Binding {
  texture: Texture;
  version: number;
  isSampler: boolean = true;

  constructor(name: string, texture: Texture) {
    super(name);

    this.texture = texture;
    this.version = texture.version;

    this.isSampler = true;
  }
}
