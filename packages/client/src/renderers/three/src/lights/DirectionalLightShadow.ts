import { LightShadow } from './LightShadow.js';
import { OrthographicCamera } from '../cameras/OrthographicCamera.js';

export class DirectionalLightShadow extends LightShadow {
  declare isDirectionalLightShadow: boolean;
  constructor() {
    super(new OrthographicCamera(-5, 5, 5, -5, 0.5, 500));
  }
}
DirectionalLightShadow.prototype.isDirectionalLightShadow = true;
