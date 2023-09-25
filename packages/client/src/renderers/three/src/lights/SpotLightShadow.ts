import { LightShadow } from './LightShadow.js';
import { MathUtils } from '../math/MathUtils.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';
import { SpotLight } from './SpotLight.js';

export class SpotLightShadow extends LightShadow {
  declare isSpotLightShadow: boolean;
  focus: number;

  constructor() {
    super(new PerspectiveCamera(50, 1, 0.5, 500));
    this.focus = 1;
  }

  updateMatrices(light: SpotLight) {
    const camera = this.camera as PerspectiveCamera;

    const fov = MathUtils.RAD2DEG * 2 * light.angle * this.focus;
    const aspect = this.mapSize.width / this.mapSize.height;
    const far = light.distance || camera.far;

    if (fov !== camera.fov || aspect !== camera.aspect || far !== camera.far) {
      camera.fov = fov;
      camera.aspect = aspect;
      camera.far = far;
      camera.updateProjectionMatrix();
    }

    super.updateMatrices(light);
  }

  copy(source: SpotLightShadow) {
    super.copy(source);

    this.focus = source.focus;

    return this;
  }
}
SpotLightShadow.prototype.isSpotLightShadow = true;
