import { Object3D } from '../core/Object3D.js';

export class Scene extends Object3D {
  constructor() {
    super();

    this.isScene = true;

    this.type = 'Scene';

    this.background = null;
    this.environment = null;
    this.fog = null;

    this.backgroundBlurriness = 0;
    this.backgroundIntensity = 1;

    this.overrideMaterial = null;

    if (typeof __THREE_DEVTOOLS__ !== 'undefined') {
      __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this }));
    }
  }

  copy(source, recursive) {
    super.copy(source, recursive);

    if (source.background !== null) this.background = source.background.clone();
    if (source.environment !== null) this.environment = source.environment.clone();
    if (source.fog !== null) this.fog = source.fog.clone();

    this.backgroundBlurriness = source.backgroundBlurriness;
    this.backgroundIntensity = source.backgroundIntensity;

    if (source.overrideMaterial !== null) this.overrideMaterial = source.overrideMaterial.clone();

    this.matrixAutoUpdate = source.matrixAutoUpdate;

    return this;
  }
}
