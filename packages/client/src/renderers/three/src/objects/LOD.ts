import { Vector3 } from '../math/Vector3.js';
import { Object3D } from '../core/Object3D.js';
import { Intersection, Raycaster } from '../core/Raycaster.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';

const _v1 = new Vector3();
const _v2 = new Vector3();

export class LOD extends Object3D {
  declare ['constructor']: new () => this;

  declare isLOD: true;
  declare type: string | 'LOD';
  levels: { distance: number; hysteresis: number; object: Object3D }[];
  autoUpdate: boolean;
  level: number = 0;

  constructor() {
    super();

    this.autoUpdate = true;
  }

  copy(source: LOD) {
    super.copy(source, false);

    const levels = source.levels;

    for (let i = 0, l = levels.length; i < l; i++) {
      const level = levels[i];

      this.addLevel(level.object.clone(), level.distance, level.hysteresis);
    }

    this.autoUpdate = source.autoUpdate;

    return this;
  }

  addLevel(object: Object3D, distance: number = 0, hysteresis: number = 0) {
    distance = Math.abs(distance);

    const levels = this.levels;

    let l;

    for (l = 0; l < levels.length; l++) {
      if (distance < levels[l].distance) {
        break;
      }
    }

    levels.splice(l, 0, { distance: distance, hysteresis: hysteresis, object: object });

    this.add(object);

    return this;
  }

  getObjectForDistance(distance: number) {
    const levels = this.levels;

    if (levels.length > 0) {
      let i, l;

      for (i = 1, l = levels.length; i < l; i++) {
        let levelDistance = levels[i].distance;

        if (levels[i].object.visible) {
          levelDistance -= levelDistance * levels[i].hysteresis;
        }

        if (distance < levelDistance) {
          break;
        }
      }

      return levels[i - 1].object;
    }

    return null;
  }

  raycast(raycaster: Raycaster, intersects: Intersection[]) {
    const levels = this.levels;

    if (levels.length > 0) {
      _v1.setFromMatrixPosition(this.matrixWorld);

      const distance = raycaster.ray.origin.distanceTo(_v1);

      this.getObjectForDistance(distance)!.raycast(raycaster, intersects);
    }
  }

  update(camera: PerspectiveCamera) {
    const levels = this.levels;

    if (levels.length > 1) {
      _v1.setFromMatrixPosition(camera.matrixWorld);
      _v2.setFromMatrixPosition(this.matrixWorld);

      const distance = _v1.distanceTo(_v2) / camera.zoom;

      levels[0].object.visible = true;

      let i, l;

      for (i = 1, l = levels.length; i < l; i++) {
        let levelDistance = levels[i].distance;

        if (levels[i].object.visible) {
          levelDistance -= levelDistance * levels[i].hysteresis;
        }

        if (distance >= levelDistance) {
          levels[i - 1].object.visible = false;
          levels[i].object.visible = true;
        } else {
          break;
        }
      }

      this.level = i - 1;

      for (; i < l; i++) {
        levels[i].object.visible = false;
      }
    }
  }
}
LOD.prototype.isLOD = true;
LOD.prototype.type = 'LOD';
