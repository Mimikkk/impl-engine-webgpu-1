import { PropertyBinding } from './PropertyBinding.js';
import { MathUtils } from '../MathUtils.js';
import { Object3D } from '../Object3D.js';

/**
 *
 * A group of objects that receives a shared animation state.
 *
 * Usage:
 *
 *  - Add objects you would otherwise pass as 'root' to the
 *    constructor or the .clipAction method of AnimationMixer.
 *
 *  - Instead pass this object as 'root'.
 *
 *  - You can also add and remove objects later when the mixer
 *    is running.
 *
 * Note:
 *
 *    Objects of this class appear as one object to the mixer,
 *    so cache control of the individual objects must be done
 *    on the group.
 *
 * Limitation:
 *
 *  - The animated properties must be compatible among the
 *    all objects in the group.
 *
 *  - A single property can either be controlled through a
 *    target group or directly, but not both.
 */

export class AnimationObjectGroup {
  nCachedObjects_: number;
  isAnimationObjectGroup: boolean;
  uuid: string;
  _objects: Object3D[];
  _indicesByUUID: Record<string, number>;
  _paths: string[];
  _parsedPaths: {
    nodeName: string;
    objectName: string;
    objectIndex: string;
    propertyName: string;
    propertyIndex: string;
    directoryName: string;
  }[];
  _bindings: PropertyBinding[][];
  _bindingsIndicesByPath: Record<string, number>;
  stats: { objects: { readonly total: number; readonly inUse: number }; readonly bindingsPerObject: number };

  constructor() {
    this.isAnimationObjectGroup = true;

    this.uuid = MathUtils.generateUUID();

    // cached objects followed by the active ones
    this._objects = Array.prototype.slice.call(arguments);

    // threshold
    // note: read by PropertyBinding.Composite
    this.nCachedObjects_ = 0;

    const indices = {};
    this._indicesByUUID = indices; // for bookkeeping

    for (let i = 0, n = arguments.length; i !== n; ++i) {
      this._indicesByUUID[arguments[i].uuid] = i;
    }

    this._paths = []; // inside: string
    this._parsedPaths = []; // inside: { we don't care, here }
    this._bindings = []; // inside: Array< PropertyBinding >
    this._bindingsIndicesByPath = {}; // inside: indices in these arrays

    const scope = this;

    this.stats = {
      objects: {
        get total() {
          return scope._objects.length;
        },
        get inUse() {
          return this.total - scope.nCachedObjects_;
        },
      },
      get bindingsPerObject() {
        return scope._bindings.length;
      },
    };
  }

  add() {
    const objects = this._objects;
    const indicesByUUID = this._indicesByUUID;
    const paths = this._paths;
    const parsedPaths = this._parsedPaths;
    const bindings = this._bindings;
    const nBindings = bindings.length;

    let knownObject = undefined;
    let nObjects = objects.length;
    let nCachedObjects = this.nCachedObjects_;

    for (let i = 0, n = arguments.length; i !== n; ++i) {
      const object = arguments[i];
      const uuid = object.uuid;
      let index = indicesByUUID[uuid];

      if (index === undefined) {
        // unknown object -> add it to the ACTIVE region

        index = nObjects++;
        indicesByUUID[uuid] = index;
        objects.push(object);

        // accounting is done, now do the same for all bindings

        for (let j = 0, m = nBindings; j !== m; ++j) {
          bindings[j].push(new PropertyBinding(object, paths[j], parsedPaths[j]));
        }
      } else if (index < nCachedObjects) {
        knownObject = objects[index];

        // move existing object to the ACTIVE region

        const firstActiveIndex = --nCachedObjects;
        const lastCachedObject = objects[firstActiveIndex];

        indicesByUUID[lastCachedObject.uuid] = index;
        objects[index] = lastCachedObject;

        indicesByUUID[uuid] = firstActiveIndex;
        objects[firstActiveIndex] = object;

        // accounting is done, now do the same for all bindings

        for (let j = 0, m = nBindings; j !== m; ++j) {
          const bindingsForPath = bindings[j];
          const lastCached = bindingsForPath[firstActiveIndex];

          let binding = bindingsForPath[index];

          bindingsForPath[index] = lastCached;

          if (binding === undefined) {
            // since we do not bother to create new bindings
            // for objects that are cached, the binding may
            // or may not exist

            binding = new PropertyBinding(object, paths[j], parsedPaths[j]);
          }

          bindingsForPath[firstActiveIndex] = binding;
        }
      } else if (objects[index] !== knownObject) {
        console.error(
          'THREE.AnimationObjectGroup: Different objects with the same UUID ' +
            'detected. Clean the caches or recreate your infrastructure when reloading scenes.',
        );
      } // else the object is already where we want it to be
    } // for arguments

    this.nCachedObjects_ = nCachedObjects;
  }

  remove() {
    const objects = this._objects;
    const indicesByUUID = this._indicesByUUID;
    const bindings = this._bindings;
    const nBindings = bindings.length;

    let nCachedObjects = this.nCachedObjects_;

    for (let i = 0, n = arguments.length; i !== n; ++i) {
      const object = arguments[i];
      const uuid = object.uuid;
      const index = indicesByUUID[uuid];

      if (index !== undefined && index >= nCachedObjects) {
        // move existing object into the CACHED region

        const lastCachedIndex = nCachedObjects++;
        const firstActiveObject = objects[lastCachedIndex];

        indicesByUUID[firstActiveObject.uuid] = index;
        objects[index] = firstActiveObject;

        indicesByUUID[uuid] = lastCachedIndex;
        objects[lastCachedIndex] = object;

        // accounting is done, now do the same for all bindings

        for (let j = 0, m = nBindings; j !== m; ++j) {
          const binding = bindings[j][index];

          bindings[j][index] = bindings[j][lastCachedIndex];
          bindings[j][lastCachedIndex] = binding;
        }
      }
    } // for arguments

    this.nCachedObjects_ = nCachedObjects;
  }

  uncache() {
    const objects = this._objects;
    const indicesByUUID = this._indicesByUUID;
    const bindings = this._bindings;
    const nBindings = bindings.length;

    let nCachedObjects = this.nCachedObjects_;
    let nObjects = objects.length;

    for (let i = 0, n = arguments.length; i !== n; ++i) {
      const object = arguments[i];
      const uuid = object.uuid;
      const index = indicesByUUID[uuid];

      if (index !== undefined) {
        delete indicesByUUID[uuid];

        if (index < nCachedObjects) {
          // object is cached, shrink the CACHED region

          const firstActiveIndex = --nCachedObjects;
          const lastCachedObject = objects[firstActiveIndex];
          const lastIndex = --nObjects;
          const lastObject = objects[lastIndex];

          // last cached object takes this object's place
          indicesByUUID[lastCachedObject.uuid] = index;
          objects[index] = lastCachedObject;

          // last object goes to the activated slot and pop
          indicesByUUID[lastObject.uuid] = firstActiveIndex;
          objects[firstActiveIndex] = lastObject;
          objects.pop();

          // accounting is done, now do the same for all bindings

          for (let j = 0, m = nBindings; j !== m; ++j) {
            const bindingsForPath = bindings[j];
            const lastCached = bindingsForPath[firstActiveIndex];
            const last = bindingsForPath[lastIndex];

            bindingsForPath[index] = lastCached;
            bindingsForPath[firstActiveIndex] = last;
            bindingsForPath.pop();
          }
        } else {
          // object is active, just swap with the last and pop

          const lastIndex = --nObjects;
          const lastObject = objects[lastIndex];

          if (lastIndex > 0) {
            indicesByUUID[lastObject.uuid] = index;
          }

          objects[index] = lastObject;
          objects.pop();

          // accounting is done, now do the same for all bindings

          for (let j = 0, m = nBindings; j !== m; ++j) {
            const bindingsForPath = bindings[j];

            bindingsForPath[index] = bindingsForPath[lastIndex];
            bindingsForPath.pop();
          }
        } // cached or active
      } // if object is known
    } // for arguments

    this.nCachedObjects_ = nCachedObjects;
  }

  // Internal interface used by befriended PropertyBinding.Composite:
  subscribe_(
    path: string,
    parsedPath: {
      nodeName: string;
      objectName: string;
      objectIndex: string;
      propertyName: string;
      propertyIndex: string;
      directoryName: string;
    },
  ) {
    // returns an array of bindings for the given path that is changed
    // according to the contained objects in the group

    const indicesByPath = this._bindingsIndicesByPath;
    let index = indicesByPath[path];
    const bindings = this._bindings;

    if (index !== undefined) return bindings[index];

    const paths = this._paths;
    const parsedPaths = this._parsedPaths;
    const objects = this._objects;
    const nObjects = objects.length;
    const nCachedObjects = this.nCachedObjects_;
    const bindingsForPath = new Array(nObjects);

    index = bindings.length;

    indicesByPath[path] = index;

    paths.push(path);
    parsedPaths.push(parsedPath);
    bindings.push(bindingsForPath);

    for (let i = nCachedObjects, n = objects.length; i !== n; ++i) {
      const object = objects[i];
      bindingsForPath[i] = new PropertyBinding(object, path, parsedPath);
    }

    return bindingsForPath;
  }

  unsubscribe_(path: string) {
    // tells the group to forget about a property path and no longer
    // update the array previously obtained with 'subscribe_'

    const indicesByPath = this._bindingsIndicesByPath;
    const index = indicesByPath[path];

    if (index !== undefined) {
      const paths = this._paths;
      const parsedPaths = this._parsedPaths;
      const bindings = this._bindings;
      const lastBindingsIndex = bindings.length - 1;
      const lastBindings = bindings[lastBindingsIndex];
      const lastBindingsPath = path[lastBindingsIndex];

      indicesByPath[lastBindingsPath] = index;

      bindings[index] = lastBindings;
      bindings.pop();

      parsedPaths[index] = parsedPaths[lastBindingsIndex];
      parsedPaths.pop();

      paths[index] = paths[lastBindingsIndex];
      paths.pop();
    }
  }
}
