import { Ray } from '../math/Ray.js';
import { Layers } from './Layers.js';
import { Vector3 } from '../math/Vector3.js';
import { Camera } from '../cameras/Camera.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';
import { OrthographicCamera } from '../cameras/OrthographicCamera.js';
import { Vector2 } from '../math/Vector2.js';
import { Object3D } from './Object3D.js';

export interface Face {
  a: number;
  b: number;
  c: number;
  normal: Vector3;
  materialIndex?: number;
}
export interface Intersection<TIntersected extends Object3D = Object3D> {
  distance: number;
  distanceToRay?: number;
  point: Vector3;
  index?: number;
  face?: Face | null;
  faceIndex?: number;
  object: TIntersected;
  uv?: Vector2;
  uv1?: Vector2;
  normal?: Vector3;
  instanceId?: number;
}
export interface RaycasterParameters {
  Mesh: Record<string, any>;
  Line: { threshold: number };
  Line2: { threshold: number };
  LOD: Record<string, any>;
  Points: { threshold: number };
  Sprite: Record<string, any>;
}

const ascSort = (a: Intersection, b: Intersection) => a.distance - b.distance;
const intersectObject = (object: Object3D, raycaster: Raycaster, intersects: Intersection[], recursive?: boolean) => {
  if (object.layers.test(raycaster.layers)) object.raycast(raycaster, intersects);

  if (recursive) {
    const children = object.children;
    for (let i = 0, l = children.length; i < l; i++) intersectObject(children[i], raycaster, intersects, true);
  }
};

export class Raycaster {
  ray: Ray;
  near: number;
  far: number;
  camera: Camera | null;
  layers: Layers;
  params: RaycasterParameters;

  constructor(origin?: Vector3, direction?: Vector3, near: number = 0, far: number = Infinity) {
    this.ray = new Ray(origin, direction);
    // direction is assumed to be normalized (for accurate distance calculations)

    this.near = near;
    this.far = far;
    this.camera = null;
    this.layers = new Layers();

    this.params = {
      Mesh: {},
      Line: { threshold: 1 },
      Line2: { threshold: 1 },
      LOD: {},
      Points: { threshold: 1 },
      Sprite: {},
    };
  }

  set(origin: Vector3, direction: Vector3): this {
    this.ray.set(origin, direction);
    return this;
  }

  setFromCamera(coords: Vector2, camera: PerspectiveCamera | OrthographicCamera): this {
    if (PerspectiveCamera.is(camera)) {
      this.ray.origin.setFromMatrixPosition(camera.matrixWorld);
      this.ray.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(this.ray.origin).normalize();
    } else if (OrthographicCamera.is(camera)) {
      this.ray.origin
        .set(coords.x, coords.y, (camera.near + camera.far) / (camera.near - camera.far))
        .unproject(camera);

      this.ray.direction.set(0, 0, -1).transformDirection(camera.matrixWorld);
    }
    this.camera = camera;

    return this;
  }

  intersectObject(object: Object3D, recursive: boolean = true, intersects: Intersection[] = []): Intersection[] {
    intersectObject(object, this, intersects, recursive);

    intersects.sort(ascSort);

    return intersects;
  }

  intersectObjects(objects: Object3D[], recursive: boolean = true, intersects: Intersection[] = []): Intersection[] {
    for (let i = 0, l = objects.length; i < l; i++) {
      intersectObject(objects[i], this, intersects, recursive);
    }

    intersects.sort(ascSort);

    return intersects;
  }
}
