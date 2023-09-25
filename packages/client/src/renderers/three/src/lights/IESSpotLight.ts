import { ColorRepresentation } from '../math/Color.js';
import { SpotLight } from './SpotLight.js';
import { Texture } from '../textures/Texture.js';

export class IESSpotLight extends SpotLight {
  iesMap: Texture | null;
  constructor(
    color?: ColorRepresentation,
    intensity?: number,
    distance?: number,
    angle?: number,
    penumbra?: number,
    decay?: number,
  ) {
    super(color, intensity, distance, angle, penumbra, decay);

    this.iesMap = null;
  }

  copy(source: IESSpotLight, recursive?: boolean) {
    super.copy(source, recursive);
    this.iesMap = source.iesMap;
    return this;
  }
}
