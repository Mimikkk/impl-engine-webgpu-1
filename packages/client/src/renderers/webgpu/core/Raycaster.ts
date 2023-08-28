import { Ray } from './Ray.js';
import { Layers } from './Layers.js';
import { Object3D } from './Object3D.js';
import { Intersection } from 'three';
import { Camera } from './camera/Camera.js';
import { Mesh } from './objects/Mesh.js';
import { Vector3 } from './Vector3.js';
import { PerspectiveCamera } from './camera/PerspectiveCamera.js';
import { OrthographicCamera } from './camera/OrthographicCamera.js';

export class Raycaster {
  ray: Ray;
  near: number;
  far: number;
  camera: Camera;
  layers: Layers;
  params: { Mesh: Mesh; Line: { threshold: number }; LOD: {}; Points: { threshold: number }; Sprite: {} };

  constructor(origin: Vector3, direction: Vector3, near: number = 0, far: number = Infinity) {
    // direction is assumed to be normalized (for accurate distance calculations)
    this.ray = new Ray(origin, direction);

    this.near = near;
    this.far = far;
    this.camera = null;
    this.layers = new Layers();

    this.params = {
      Mesh: {},
      Line: { threshold: 1 },
      LOD: {},
      Points: { threshold: 1 },
      Sprite: {},
    };
  }

  set(origin: Vector3, direction: Vector3) {
    // direction is assumed to be normalized (for accurate distance calculations)
    this.ray.set(origin, direction);
  }

  setFromCamera(coords: Vector3, camera: PerspectiveCamera | OrthographicCamera) {
    if ('isPerspectiveCamera' in camera) {
      this.ray.origin.setFromMatrixPosition(camera.matrixWorld);
      this.ray.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(this.ray.origin).normalize();
      this.camera = camera;
      return;
    }
    if ('isOrthographicCamera' in camera) {
      this.ray.origin
        .set(coords.x, coords.y, (camera.near + camera.far) / (camera.near - camera.far))
        .unproject(camera); // set origin in plane of camera
      this.ray.direction.set(0, 0, -1).transformDirection(camera.matrixWorld);
      this.camera = camera;
    }
  }

  intersectObject(object: Object3D, recursive: boolean = true, intersects: Intersection[] = []) {
    intersectObject(object, this, intersects, recursive);

    intersects.sort(ascSort);

    return intersects;
  }

  intersectObjects(objects: Object3D[], recursive: boolean = true, intersects: Intersection[] = []) {
    for (let i = 0, l = objects.length; i < l; i++) {
      intersectObject(objects[i], this, intersects, recursive);
    }

    intersects.sort(ascSort);

    return intersects;
  }
}

function ascSort(a: Intersection, b: Intersection) {
  return a.distance - b.distance;
}

function intersectObject(object: Object3D, raycaster: Raycaster, intersects: Intersection[], recursive?: boolean) {
  if (object.layers.test(raycaster.layers)) object.raycast(raycaster, intersects);

  if (recursive) {
    const children = object.children;

    for (let i = 0, l = children.length; i < l; i++) {
      intersectObject(children[i], raycaster, intersects, true);
    }
  }
}
