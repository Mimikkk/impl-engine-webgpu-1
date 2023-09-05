import { Light } from './Light.js';
import { SpotLightShadow } from './SpotLightShadow.js';
import { Object3D } from '../Object3D.js';
import { Color } from '../Color.js';

class SpotLight extends Light {
  isSpotLight: boolean = true;
  type: string = 'SpotLight';
  distance: number;
  angle: number;
  penumbra: number;
  decay: number;
  shadow: SpotLightShadow;

  constructor(color: Color, intensity: number, distance = 0, angle = Math.PI / 3, penumbra = 0, decay = 2) {
    super(color, intensity);

    this.position.copy(Object3D.DEFAULT_UP);
    this.updateMatrix();

    this.distance = distance;
    this.angle = angle;
    this.penumbra = penumbra;
    this.decay = decay;

    this.shadow = new SpotLightShadow();
  }

  get power() {
    // compute the light's luminous power (in lumens) from its intensity (in candela)
    // by convention for a spotlight, luminous power (lm) = π * luminous intensity (cd)
    return this.intensity * Math.PI;
  }

  set power(power) {
    // set the light's intensity (in candela) from the desired luminous power (in lumens)
    this.intensity = power / Math.PI;
  }

  copy(source: SpotLight, recursive?: boolean): SpotLight {
    super.copy(source, recursive);

    this.distance = source.distance;
    this.angle = source.angle;
    this.penumbra = source.penumbra;
    this.decay = source.decay;
    this.target = source.target.clone();
    this.shadow = source.shadow.clone();

    return this;
  }
}

export { SpotLight };
