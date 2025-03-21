import { Object3D } from '../Object3D.js';
import { Color } from '../Color.js';

export class Light extends Object3D {
  isLight: boolean = true;
  type: string = 'Light';
  color: Color;
  intensity: number;
  target: Object3D = new Object3D();

  constructor(color: Color, intensity: number = 1) {
    super();

    this.color = color;
    this.intensity = intensity;
  }

  dispose() {}
  copy(source: Light, recursive?: boolean): Light {
    super.copy(source, recursive);
    this.color.copy(source.color);
    this.intensity = source.intensity;
    return this;
  }
}
