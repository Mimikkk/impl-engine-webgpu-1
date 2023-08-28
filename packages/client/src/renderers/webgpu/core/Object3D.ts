import { Quaternion } from './Quaternion.js';
import { Vector3 } from './Vector3.js';
import { Matrix4 } from './Matrix4.js';
import { EventDispatcher } from './EventDispatcher.js';
import { Euler } from './Euler.js';
import { Layers } from './Layers.js';
import { Matrix3 } from './Matrix3.js';
import { MathUtils } from './MathUtils.js';

let _object3DId = 0;

const _v1 = /*@__PURE__*/ new Vector3();
const _q1 = /*@__PURE__*/ new Quaternion();
const _m1 = /*@__PURE__*/ new Matrix4();
const _target = /*@__PURE__*/ new Vector3();

const _position = /*@__PURE__*/ new Vector3();
const _scale = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();

const _xAxis = /*@__PURE__*/ new Vector3(1, 0, 0);
const _yAxis = /*@__PURE__*/ new Vector3(0, 1, 0);
const _zAxis = /*@__PURE__*/ new Vector3(0, 0, 1);

const _addedEvent = { type: 'added', target: null };
const _removedEvent = { type: 'removed', target: null };

class Object3D extends EventDispatcher {
  layers: any;
  static DEFAULT_UP: Vector3 = new Vector3(0, 1, 0);
  static DEFAULT_MATRIX_AUTO_UPDATE: boolean = true;
  static DEFAULT_MATRIX_WORLD_AUTO_UPDATE: boolean = true;
  isObject3D: boolean;
  uuid: string;
  name: string;
  type: string;
  parent: Object3D | null;
  children: Object3D[];
  up: Vector3;

  position: Vector3;
  rotation: Euler;
  quaternion: Quaternion;
  scale: Vector3;
  modelViewMatrix: Matrix4;
  normalMatrix: Matrix3;
  matrix: Matrix4;
  matrixWorld: Matrix4;
  matrixAutoUpdate: boolean;
  matrixWorldNeedsUpdate: boolean;
  matrixWorldAutoUpdate: boolean;
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
  frustumCulled: boolean;
  renderOrder: number;
  animations: never[];
  userData: any;

  constructor() {
    super();

    this.isObject3D = true;

    Object.defineProperty(this, 'id', { value: _object3DId++ });

    this.uuid = MathUtils.generateUUID();

    this.name = '';
    this.type = 'Object3D';

    this.parent = null;
    this.children = [];

    this.up = Object3D.DEFAULT_UP.clone();

    const position = new Vector3();
    const rotation = new Euler();
    const quaternion = new Quaternion();
    const scale = new Vector3(1, 1, 1);

    function onRotationChange() {
      quaternion.setFromEuler(rotation, false);
    }

    function onQuaternionChange() {
      rotation.setFromQuaternion(quaternion, undefined, false);
    }

    rotation._onChange(onRotationChange);
    quaternion._onChange(onQuaternionChange);

    this.position = position;
    this.rotation = rotation;
    this.quaternion = quaternion;
    this.scale = scale;
    this.modelViewMatrix = new Matrix4();
    this.normalMatrix = new Matrix3();

    this.matrix = new Matrix4();
    this.matrixWorld = new Matrix4();

    this.matrixAutoUpdate = Object3D.DEFAULT_MATRIX_AUTO_UPDATE;
    this.matrixWorldNeedsUpdate = false;

    this.matrixWorldAutoUpdate = Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE; // checked by the renderer

    this.layers = new Layers();
    this.visible = true;

    this.castShadow = false;
    this.receiveShadow = false;

    this.frustumCulled = true;
    this.renderOrder = 0;

    this.animations = [];

    this.userData = {};
  }

  onBeforeRender(/* renderer, scene, camera, geometry, material, group */) {}

  onAfterRender(/* renderer, scene, camera, geometry, material, group */) {}

  applyMatrix4(matrix: Matrix4) {
    if (this.matrixAutoUpdate) this.updateMatrix();

    this.matrix.premultiply(matrix);

    this.matrix.decompose(this.position, this.quaternion, this.scale);
  }

  applyQuaternion(q: Quaternion) {
    this.quaternion.premultiply(q);

    return this;
  }

  setRotationFromAxisAngle(axis: Vector3, angle: number) {
    // assumes axis is normalized

    this.quaternion.setFromAxisAngle(axis, angle);
  }

  setRotationFromEuler(euler: Euler) {
    this.quaternion.setFromEuler(euler, true);
  }

  setRotationFromMatrix(m: Matrix4) {
    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

    this.quaternion.setFromRotationMatrix(m);
  }

  setRotationFromQuaternion(q: Quaternion) {
    // assumes q is normalized

    this.quaternion.copy(q);
  }

  rotateOnAxis(axis: Vector3, angle: number) {
    // rotate object on axis in object space
    // axis is assumed to be normalized

    _q1.setFromAxisAngle(axis, angle);

    this.quaternion.multiply(_q1);

    return this;
  }

  rotateOnWorldAxis(axis: Vector3, angle: number) {
    // rotate object on axis in world space
    // axis is assumed to be normalized
    // method assumes no rotated parent

    _q1.setFromAxisAngle(axis, angle);

    this.quaternion.premultiply(_q1);

    return this;
  }

  rotateX(angle: number) {
    return this.rotateOnAxis(_xAxis, angle);
  }

  rotateY(angle: number) {
    return this.rotateOnAxis(_yAxis, angle);
  }

  rotateZ(angle: number) {
    return this.rotateOnAxis(_zAxis, angle);
  }

  translateOnAxis(axis: Vector3, distance: number) {
    // translate object by distance along axis in object space
    // axis is assumed to be normalized

    _v1.copy(axis).applyQuaternion(this.quaternion);

    this.position.add(_v1.multiplyScalar(distance));

    return this;
  }

  translateX(distance: number) {
    return this.translateOnAxis(_xAxis, distance);
  }

  translateY(distance: number) {
    return this.translateOnAxis(_yAxis, distance);
  }

  translateZ(distance: number) {
    return this.translateOnAxis(_zAxis, distance);
  }

  localToWorld(vector: Vector3) {
    this.updateWorldMatrix(true, false);

    return vector.applyMatrix4(this.matrixWorld);
  }

  worldToLocal(vector: Vector3) {
    this.updateWorldMatrix(true, false);

    return vector.applyMatrix4(_m1.copy(this.matrixWorld).invert());
  }

  lookAt(x: Vector3 | number, y: number, z: number) {
    // This method does not support objects having non-uniformly-scaled parent(s)

    if (typeof x === 'object') {
      _target.copy(x);
    } else {
      _target.set(x, y, z);
    }

    const parent = this.parent;

    this.updateWorldMatrix(true, false);

    _position.setFromMatrixPosition(this.matrixWorld);

    if (this.isCamera || this.isLight) {
      _m1.lookAt(_position, _target, this.up);
    } else {
      _m1.lookAt(_target, _position, this.up);
    }

    this.quaternion.setFromRotationMatrix(_m1);

    if (parent) {
      _m1.extractRotation(parent.matrixWorld);
      _q1.setFromRotationMatrix(_m1);
      this.quaternion.premultiply(_q1.invert());
    }
  }

  add(object: Object3D) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this.add(arguments[i]);
      }

      return this;
    }

    if (object === this) {
      console.error("THREE.Object3D.add: object can't be added as a child of itself.", object);
      return this;
    }

    if (object && object.isObject3D) {
      if (object.parent !== null) {
        object.parent.remove(object);
      }

      object.parent = this;
      this.children.push(object);

      object.dispatchEvent(_addedEvent);
    } else {
      console.error('THREE.Object3D.add: object not an instance of THREE.Object3D.', object);
    }

    return this;
  }

  remove(object: Object3D) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this.remove(arguments[i]);
      }

      return this;
    }

    const index = this.children.indexOf(object);

    if (index !== -1) {
      object.parent = null;
      this.children.splice(index, 1);

      object.dispatchEvent(_removedEvent);
    }

    return this;
  }

  removeFromParent() {
    const parent = this.parent;

    if (parent !== null) {
      parent.remove(this);
    }

    return this;
  }

  clear() {
    for (let i = 0; i < this.children.length; i++) {
      const object = this.children[i];

      object.parent = null;

      object.dispatchEvent(_removedEvent);
    }

    this.children.length = 0;

    return this;
  }

  attach(object: Object3D) {
    // adds object as a child of this, while maintaining the object's world transform

    // Note: This method does not support scene graphs having non-uniformly-scaled nodes(s)

    this.updateWorldMatrix(true, false);

    _m1.copy(this.matrixWorld).invert();

    if (object.parent !== null) {
      object.parent.updateWorldMatrix(true, false);

      _m1.multiply(object.parent.matrixWorld);
    }

    object.applyMatrix4(_m1);

    this.add(object);

    object.updateWorldMatrix(false, true);

    return this;
  }

  getObjectById(id: string) {
    return this.getObjectByProperty('id', id);
  }

  getObjectByName(name: string) {
    return this.getObjectByProperty('name', name);
  }

  getObjectByProperty(name: string, value: any) {
    if (this[name as keyof this] === value) return this;

    for (let i = 0, l = this.children.length; i < l; i++) {
      const child = this.children[i];
      const object = child.getObjectByProperty(name, value) as Object3D;

      if (object) return object;
    }

    return undefined;
  }

  getObjectsByProperty(name: string, value: any) {
    let result = [];

    if (this[name as keyof this] === value) result.push(this);

    for (let i = 0, l = this.children.length; i < l; i++) {
      const childResult = this.children[i].getObjectsByProperty(name, value) as any;

      if (childResult.length > 0) {
        result = result.concat(childResult);
      }
    }

    return result;
  }

  getWorldPosition(target: Vector3) {
    this.updateWorldMatrix(true, false);

    return target.setFromMatrixPosition(this.matrixWorld);
  }

  getWorldQuaternion(target: Quaternion) {
    this.updateWorldMatrix(true, false);

    this.matrixWorld.decompose(_position, target, _scale);

    return target;
  }

  getWorldScale(target: Vector3) {
    this.updateWorldMatrix(true, false);

    this.matrixWorld.decompose(_position, _quaternion, target);

    return target;
  }

  getWorldDirection(target: Vector3) {
    this.updateWorldMatrix(true, false);

    const e = this.matrixWorld.elements;

    return target.set(e[8], e[9], e[10]).normalize();
  }

  raycast(/* raycaster, intersects */) {}

  traverse(callback: (object: Object3D) => void) {
    callback(this);

    const children = this.children;

    for (let i = 0, l = children.length; i < l; i++) {
      children[i].traverse(callback);
    }
  }

  traverseVisible(callback: (object: Object3D) => void) {
    if (this.visible === false) return;

    callback(this);

    const children = this.children;

    for (let i = 0, l = children.length; i < l; i++) {
      children[i].traverseVisible(callback);
    }
  }

  traverseAncestors(callback: (object: Object3D) => void) {
    const parent = this.parent;

    if (parent !== null) {
      callback(parent);

      parent.traverseAncestors(callback);
    }
  }

  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale);

    this.matrixWorldNeedsUpdate = true;
  }

  updateMatrixWorld(force?: boolean) {
    if (this.matrixAutoUpdate) this.updateMatrix();

    if (this.matrixWorldNeedsUpdate || force) {
      if (this.parent === null) {
        this.matrixWorld.copy(this.matrix);
      } else {
        this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
      }

      this.matrixWorldNeedsUpdate = false;

      force = true;
    }

    // update children

    const children = this.children;

    for (let i = 0, l = children.length; i < l; i++) {
      const child = children[i];

      if (child.matrixWorldAutoUpdate === true || force === true) {
        child.updateMatrixWorld(force);
      }
    }
  }

  updateWorldMatrix(updateParents?: boolean, updateChildren?: boolean) {
    const parent = this.parent;

    if (updateParents === true && parent !== null && parent.matrixWorldAutoUpdate === true) {
      parent.updateWorldMatrix(true, false);
    }

    if (this.matrixAutoUpdate) this.updateMatrix();

    if (this.parent === null) {
      this.matrixWorld.copy(this.matrix);
    } else {
      this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
    }

    // update children

    if (updateChildren === true) {
      const children = this.children;

      for (let i = 0, l = children.length; i < l; i++) {
        const child = children[i];

        if (child.matrixWorldAutoUpdate === true) {
          child.updateWorldMatrix(false, true);
        }
      }
    }
  }

  toJSON(meta?: any) {
    // meta is a string when called from JSON.stringify
    const isRootObject = meta === undefined || typeof meta === 'string';

    const output = {};

    // meta is a hash used to collect geometries, materials.
    // not providing it implies that this is the root object
    // being serialized.
    if (isRootObject) {
      // initialize meta obj
      meta = {
        geometries: {},
        materials: {},
        textures: {},
        images: {},
        shapes: {},
        skeletons: {},
        animations: {},
        nodes: {},
      };

      output.metadata = {
        version: 4.6,
        type: 'Object',
        generator: 'Object3D.toJSON',
      };
    }

    // standard Object3D serialization

    const object = {
      uuid: undefined,
    };

    object.uuid = this.uuid;
    object.type = this.type;

    if (this.name !== '') object.name = this.name;
    if (this.castShadow === true) object.castShadow = true;
    if (this.receiveShadow === true) object.receiveShadow = true;
    if (this.visible === false) object.visible = false;
    if (this.frustumCulled === false) object.frustumCulled = false;
    if (this.renderOrder !== 0) object.renderOrder = this.renderOrder;
    if (Object.keys(this.userData).length > 0) object.userData = this.userData;

    object.layers = this.layers.mask;
    object.matrix = this.matrix.toArray();
    object.up = this.up.toArray();

    if (this.matrixAutoUpdate === false) object.matrixAutoUpdate = false;

    // object specific properties

    if (this.isInstancedMesh) {
      object.type = 'InstancedMesh';
      object.count = this.count;
      object.instanceMatrix = this.instanceMatrix.toJSON();
      if (this.instanceColor !== null) object.instanceColor = this.instanceColor.toJSON();
    }

    //

    function serialize(library, element) {
      if (library[element.uuid] === undefined) {
        library[element.uuid] = element.toJSON(meta);
      }

      return element.uuid;
    }

    if (this.isScene) {
      if (this.background) {
        if (this.background.isColor) {
          object.background = this.background.toJSON();
        } else if (this.background.isTexture) {
          object.background = this.background.toJSON(meta).uuid;
        }
      }

      if (this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== true) {
        object.environment = this.environment.toJSON(meta).uuid;
      }
    } else if (this.isMesh || this.isLine || this.isPoints) {
      object.geometry = serialize(meta.geometries, this.geometry);

      const parameters = this.geometry.parameters;

      if (parameters !== undefined && parameters.shapes !== undefined) {
        const shapes = parameters.shapes;

        if (Array.isArray(shapes)) {
          for (let i = 0, l = shapes.length; i < l; i++) {
            const shape = shapes[i];

            serialize(meta.shapes, shape);
          }
        } else {
          serialize(meta.shapes, shapes);
        }
      }
    }

    if (this.isSkinnedMesh) {
      object.bindMode = this.bindMode;
      object.bindMatrix = this.bindMatrix.toArray();

      if (this.skeleton !== undefined) {
        serialize(meta.skeletons, this.skeleton);

        object.skeleton = this.skeleton.uuid;
      }
    }

    if (this.material !== undefined) {
      if (Array.isArray(this.material)) {
        const uuids = [];

        for (let i = 0, l = this.material.length; i < l; i++) {
          uuids.push(serialize(meta.materials, this.material[i]));
        }

        object.material = uuids;
      } else {
        object.material = serialize(meta.materials, this.material);
      }
    }

    //

    if (this.children.length > 0) {
      object.children = [];

      for (let i = 0; i < this.children.length; i++) {
        object.children.push(this.children[i].toJSON(meta).object);
      }
    }

    //

    if (this.animations.length > 0) {
      object.animations = [];

      for (let i = 0; i < this.animations.length; i++) {
        const animation = this.animations[i];

        object.animations.push(serialize(meta.animations, animation));
      }
    }

    if (isRootObject) {
      const geometries = extractFromCache(meta.geometries);
      const materials = extractFromCache(meta.materials);
      const textures = extractFromCache(meta.textures);
      const images = extractFromCache(meta.images);
      const shapes = extractFromCache(meta.shapes);
      const skeletons = extractFromCache(meta.skeletons);
      const animations = extractFromCache(meta.animations);
      const nodes = extractFromCache(meta.nodes);

      if (geometries.length > 0) output.geometries = geometries;
      if (materials.length > 0) output.materials = materials;
      if (textures.length > 0) output.textures = textures;
      if (images.length > 0) output.images = images;
      if (shapes.length > 0) output.shapes = shapes;
      if (skeletons.length > 0) output.skeletons = skeletons;
      if (animations.length > 0) output.animations = animations;
      if (nodes.length > 0) output.nodes = nodes;
    }

    output.object = object;

    return output;

    // extract data from the cache hash
    // remove metadata on each item
    // and return as array
    function extractFromCache(cache) {
      const values = [];
      for (const key in cache) {
        const data = cache[key];
        delete data.metadata;
        values.push(data);
      }

      return values;
    }
  }

  clone(recursive?: boolean) {
    return new Object3D().copy(this, recursive);
  }

  copy(source: Object3D, recursive: boolean = true) {
    this.name = source.name;

    this.up.copy(source.up);

    this.position.copy(source.position);
    this.rotation.order = source.rotation.order;
    this.quaternion.copy(source.quaternion);
    this.scale.copy(source.scale);

    this.matrix.copy(source.matrix);
    this.matrixWorld.copy(source.matrixWorld);

    this.matrixAutoUpdate = source.matrixAutoUpdate;
    this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

    this.matrixWorldAutoUpdate = source.matrixWorldAutoUpdate;

    this.layers.mask = source.layers.mask;
    this.visible = source.visible;

    this.castShadow = source.castShadow;
    this.receiveShadow = source.receiveShadow;

    this.frustumCulled = source.frustumCulled;
    this.renderOrder = source.renderOrder;

    this.animations = source.animations.slice();

    this.userData = JSON.parse(JSON.stringify(source.userData));

    if (recursive) {
      for (let i = 0; i < source.children.length; i++) {
        const child = source.children[i];
        this.add(child.clone());
      }
    }

    return this;
  }
}

export { Object3D };
