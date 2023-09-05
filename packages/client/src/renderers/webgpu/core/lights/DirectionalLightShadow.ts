import { LightShadow } from './LightShadow.js';
import { OrthographicCamera } from '../camera/OrthographicCamera.js';

export class DirectionalLightShadow extends LightShadow {
  isDirectionalLightShadow: boolean = true;

  constructor() {
    super(new OrthographicCamera(-5, 5, 5, -5, 0.5, 500));
  }

  clone(): DirectionalLightShadow {
    return new DirectionalLightShadow();
  }
}
