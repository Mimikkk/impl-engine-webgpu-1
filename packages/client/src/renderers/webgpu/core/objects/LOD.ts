import { Object3D } from '../Object3D.js';
import { Raycaster } from '../Raycaster.js';
import { Vector3 } from '../Vector3.js';
import { Intersection } from 'three';
import { Camera } from '../camera/Camera.js';

const _v1 = /*@__PURE__*/ new Vector3();
const _v2 = /*@__PURE__*/ new Vector3();

class LOD extends Object3D {
  _currentLevel: number;
  type: string;
  autoUpdate: boolean;
  levels: {
    object: Object3D;
    distance: number;
    hysteresis: number;
  }[] = [];
  isLOD: boolean = true;

  constructor() {
    super();

    this._currentLevel = 0;

    this.type = 'LOD';

    this.autoUpdate = true;
  }

  copy(source: LOD) {
    super.copy(source as this, false);

    const levels = source.levels;

    for (let i = 0, l = levels.length; i < l; i++) {
      const level = levels[i];

      this.addLevel(level.object.clone(), level.distance, level.hysteresis);
    }

    this.autoUpdate = source.autoUpdate;

    return this;
  }

  addLevel(object: Object3D, distance = 0, hysteresis = 0) {
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

  getCurrentLevel() {
    return this._currentLevel;
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

  update(camera: Camera) {
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

      this._currentLevel = i - 1;

      for (; i < l; i++) {
        levels[i].object.visible = false;
      }
    }
  }

  toJSON(meta?: any) {
    const data = super.toJSON(meta);

    if (this.autoUpdate === false) data.object.autoUpdate = false;

    data.object.levels = [];

    const levels = this.levels;

    for (let i = 0, l = levels.length; i < l; i++) {
      const level = levels[i];

      data.object.levels.push({
        object: level.object.uuid,
        distance: level.distance,
        hysteresis: level.hysteresis,
      });
    }

    return data;
  }
}

export { LOD };
