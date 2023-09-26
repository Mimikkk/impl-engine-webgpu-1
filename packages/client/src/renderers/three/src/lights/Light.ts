import { Object3D } from '../core/Object3D.js';
import { Color, ColorRepresentation } from '../math/Color.js';

export class Light extends Object3D {
  declare is: (item?: any) => item is Light;
  declare isLight: boolean;
  declare type: string | 'Light';
  color: Color;
  intensity: number;
  target: Object3D;

  constructor(color?: ColorRepresentation, intensity: number = 1) {
    super();

    this.color = new Color(color);
    this.intensity = intensity;
  }

  dispose() {}

  copy(source: Light, recursive?: boolean) {
    super.copy(source, recursive);

    this.color.copy(source.color);
    this.intensity = source.intensity;

    return this;
  }
}
Light.prototype.isLight = true;
Light.prototype.type = 'Light';
