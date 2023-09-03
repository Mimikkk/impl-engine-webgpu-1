import { LightShadow } from './LightShadow.js';
import { OrthographicCamera } from '../camera/OrthographicCamera.js';

class DirectionalLightShadow extends LightShadow {
  constructor() {
    super(new OrthographicCamera(-5, 5, 5, -5, 0.5, 500));

    this.isDirectionalLightShadow = true;
  }
}

export { DirectionalLightShadow };
