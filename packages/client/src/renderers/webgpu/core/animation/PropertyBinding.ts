// Characters [].:/ are reserved for track binding syntax.
import { NumberArray } from '../types.js';
import { AnimationObjectGroup } from './AnimationObjectGroup.js';
import { Object3D } from '../Object3D.js';
const _RESERVED_CHARS_RE = '\\[\\]\\.:\\/';
const _reservedRe = new RegExp('[' + _RESERVED_CHARS_RE + ']', 'g');

// Attempts to allow node names from any language. ES5's `\w` regexp matches
// only latin characters, and the unicode \p{L} is not yet supported. So
// instead, we exclude reserved characters and match everything else.
const _wordChar = '[^' + _RESERVED_CHARS_RE + ']';
const _wordCharOrDot = '[^' + _RESERVED_CHARS_RE.replace('\\.', '') + ']';

// Parent directories, delimited by '/' or ':'. Currently unused, but must
// be matched to parse the rest of the track name.
const _directoryRe = /((?:WC+[\/:])*)/.source.replace('WC', _wordChar);

// Target node. May contain word characters (a-zA-Z0-9_) and '.' or '-'.
const _nodeRe = /(WCOD+)?/.source.replace('WCOD', _wordCharOrDot);

// Object on target node, and accessor. May not contain reserved
// characters. Accessor may contain any character except closing bracket.
const _objectRe = /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace('WC', _wordChar);

// Property and accessor. May not contain reserved characters. Accessor may
// contain any non-bracket characters.
const _propertyRe = /\.(WC+)(?:\[(.+)\])?/.source.replace('WC', _wordChar);

const _trackRe = new RegExp('' + '^' + _directoryRe + _nodeRe + _objectRe + _propertyRe + '$');

const _supportedObjectNames = ['material', 'materials', 'bones', 'map'];

class Composite {
  _targetGroup: AnimationObjectGroup;
  _bindings: PropertyBinding[];

  constructor(
    targetGroup: AnimationObjectGroup,
    path: string,
    optionalParsedPath?: {
      nodeName: string;
      objectName: string;
      objectIndex: string;
      propertyName: string;
      propertyIndex: string;
      directoryName: string;
    },
  ) {
    const parsedPath = optionalParsedPath || PropertyBinding.parseTrackName(path);

    this._targetGroup = targetGroup;
    this._bindings = targetGroup.subscribe_(path, parsedPath);
  }

  getValue(array: NumberArray, offset: number) {
    this.bind(); // bind all binding

    const firstValidIndex = this._targetGroup.nCachedObjects_;
    const binding = this._bindings[firstValidIndex];

    // and only call .getValue on the first
    if (binding !== undefined) binding.getValue(array, offset);
  }

  setValue(array: NumberArray, offset: number) {
    const bindings = this._bindings;

    for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) {
      bindings[i].setValue(array, offset);
    }
  }

  bind() {
    const bindings = this._bindings;

    for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) {
      bindings[i].bind();
    }
  }

  unbind() {
    const bindings = this._bindings;

    for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) {
      bindings[i].unbind();
    }
  }
}

// Note: This class uses a State pattern on a per-method basis:
// 'bind' sets 'this.getValue' / 'setValue' and shadows the
// prototype version of these methods with one that represents
// the bound state. When the property is not found, the methods
// become no-ops.

export class PropertyBinding {
  declare ['constructor']: new () => this;

  static Composite = Composite;
  BindingType: { Direct: number; EntireArray: number; ArrayElement: number; HasFromToArray: number };
  Versioning: { None: number; NeedsUpdate: number; MatrixWorldNeedsUpdate: number };
  GetterByBindingType: ((buffer: any, offset: any) => void)[];
  SetterByBindingTypeAndVersioning: ((buffer: any, offset: any) => void)[][];
  path: string;
  parsedPath: {
    nodeName: string;
    objectName: string;
    objectIndex: string;
    propertyName: string;
    propertyIndex: string;
    directoryName: string;
  };
  rootNode: Object3D;
  getValue: (targetArray: NumberArray, offset: number) => void;
  setValue: (sourceArray: NumberArray, offset: number) => void;
  node: Object3D | null;
  targetObject: any;
  propertyName: string;
  resolvedProperty: any;
  propertyIndex: any;

  constructor(
    rootNode: Object3D,
    path: string,
    parsedPath?: {
      nodeName: string;
      objectName: string;
      objectIndex: string;
      propertyName: string;
      propertyIndex: string;
      directoryName: string;
    },
  ) {
    this.path = path;
    this.parsedPath = parsedPath || PropertyBinding.parseTrackName(path);

    this.node = PropertyBinding.findNode(rootNode, this.parsedPath.nodeName);

    this.rootNode = rootNode;

    // initial state of these methods that calls 'bind'
    this.getValue = this._getValue_unbound;
    this.setValue = this._setValue_unbound;
  }

  static create(
    root: Object3D | AnimationObjectGroup,
    path: string,
    parsedPath?: {
      nodeName: string;
      objectName: string;
      objectIndex: string;
      propertyName: string;
      propertyIndex: string;
      directoryName: string;
    },
  ) {
    return !('isAnimationObjectGroup' in root)
      ? new PropertyBinding(root as Object3D, path, parsedPath)
      : new PropertyBinding.Composite(root, path, parsedPath);
  }

  /**
   * Replaces spaces with underscores and removes unsupported characters from
   * node names, to ensure compatibility with parseTrackName().
   *
   * @param {string} name Node name to be sanitized.
   * @return {string}
   */
  static sanitizeNodeName(name: string) {
    return name.replace(/\s/g, '_').replace(_reservedRe, '');
  }

  static parseTrackName(trackName: string) {
    const matches = _trackRe.exec(trackName);

    if (matches === null) {
      throw new Error('PropertyBinding: Cannot parse trackName: ' + trackName);
    }

    const results = {
      directoryName: matches[1],
      nodeName: matches[2],
      objectName: matches[3],
      objectIndex: matches[4],
      propertyName: matches[5],
      propertyIndex: matches[6],
    };

    const lastDot = results.nodeName ? results.nodeName.lastIndexOf('.') : undefined;

    if (lastDot !== undefined && lastDot !== -1) {
      const objectName = results.nodeName.substring(lastDot + 1);

      // Object names must be checked against an allowlist. Otherwise, there
      // is no way to parse 'foo.bar.baz': 'baz' must be a property, but
      // 'bar' could be the objectName, or part of a nodeName (which can
      // include '.' characters).
      if (_supportedObjectNames.indexOf(objectName) !== -1) {
        results.nodeName = results.nodeName.substring(0, lastDot);
        results.objectName = objectName;
      }
    }

    if (results.propertyName === null || results.propertyName.length === 0) {
      throw new Error('PropertyBinding: can not parse propertyName from trackName: ' + trackName);
    }

    return results;
  }

  static findNode(root: Object3D, nodeName: string): Object3D | null {
    if (
      nodeName === undefined ||
      nodeName === '' ||
      nodeName === '.' ||
      //@ts-expect-error
      nodeName === -1 ||
      nodeName === root.name ||
      nodeName === root.uuid
    ) {
      return root;
    }

    // search into skeleton bones.
    if (root.skeleton) {
      const bone = root.skeleton.getBoneByName(nodeName);
      if (bone) return bone;
    }

    // search into node subtree.
    if (root.children) {
      const searchNodeSubtree = (children: Object3D[]): Object3D | null => {
        for (let i = 0; i < children.length; i++) {
          const childNode = children[i];

          if (childNode.name === nodeName || childNode.uuid === nodeName) {
            return childNode;
          }

          const result = searchNodeSubtree(childNode.children);

          if (result) return result;
        }

        return null;
      };

      const subTreeNode = searchNodeSubtree(root.children);
      if (subTreeNode) return subTreeNode;
    }

    return null;
  }

  // these are used to "bind" a nonexistent property
  _getValue_unavailable() {}
  _setValue_unavailable() {}

  // Getters

  _getValue_direct(buffer: NumberArray, offset: number) {
    buffer[offset] = this.targetObject[this.propertyName as keyof typeof this.targetObject];
  }

  _getValue_array(buffer: NumberArray, offset: number) {
    const source = this.resolvedProperty;

    for (let i = 0, n = source.length; i !== n; ++i) {
      buffer[offset++] = source[i];
    }
  }

  _getValue_arrayElement(buffer: NumberArray, offset: number) {
    buffer[offset] = this.resolvedProperty[this.propertyIndex];
  }

  _getValue_toArray(buffer: NumberArray, offset: number) {
    this.resolvedProperty.toArray(buffer, offset);
  }

  // Direct

  _setValue_direct(buffer: NumberArray, offset: number) {
    this.targetObject[this.propertyName as any]! = buffer[offset] as any;
  }

  _setValue_direct_setNeedsUpdate(buffer: NumberArray, offset: number) {
    this.targetObject[this.propertyName] = buffer[offset];
    this.targetObject.needsUpdate = true;
  }

  _setValue_direct_setMatrixWorldNeedsUpdate(buffer: NumberArray, offset: number) {
    this.targetObject[this.propertyName] = buffer[offset];
    this.targetObject.matrixWorldNeedsUpdate = true;
  }

  // EntireArray

  _setValue_array(buffer: NumberArray, offset: number) {
    const dest = this.resolvedProperty;

    for (let i = 0, n = dest.length; i !== n; ++i) {
      dest[i] = buffer[offset++];
    }
  }

  _setValue_array_setNeedsUpdate(buffer: NumberArray, offset: number) {
    const dest = this.resolvedProperty;

    for (let i = 0, n = dest.length; i !== n; ++i) {
      dest[i] = buffer[offset++];
    }

    this.targetObject.needsUpdate = true;
  }

  _setValue_array_setMatrixWorldNeedsUpdate(buffer: NumberArray, offset: number) {
    const dest = this.resolvedProperty;

    for (let i = 0, n = dest.length; i !== n; ++i) {
      dest[i] = buffer[offset++];
    }

    this.targetObject.matrixWorldNeedsUpdate = true;
  }

  // ArrayElement

  _setValue_arrayElement(buffer: NumberArray, offset: number) {
    this.resolvedProperty[this.propertyIndex] = buffer[offset];
  }

  _setValue_arrayElement_setNeedsUpdate(buffer: NumberArray, offset: number) {
    this.resolvedProperty[this.propertyIndex] = buffer[offset];
    this.targetObject.needsUpdate = true;
  }

  _setValue_arrayElement_setMatrixWorldNeedsUpdate(buffer: NumberArray, offset: number) {
    this.resolvedProperty[this.propertyIndex] = buffer[offset];
    this.targetObject.matrixWorldNeedsUpdate = true;
  }

  // HasToFromArray

  _setValue_fromArray(buffer: NumberArray, offset: number) {
    this.resolvedProperty.fromArray(buffer, offset);
  }

  _setValue_fromArray_setNeedsUpdate(buffer: NumberArray, offset: number) {
    this.resolvedProperty.fromArray(buffer, offset);
    this.targetObject.needsUpdate = true;
  }

  _setValue_fromArray_setMatrixWorldNeedsUpdate(buffer: NumberArray, offset: number) {
    this.resolvedProperty.fromArray(buffer, offset);
    this.targetObject.matrixWorldNeedsUpdate = true;
  }

  _getValue_unbound(targetArray: NumberArray, offset: number) {
    this.bind();
    this.getValue(targetArray, offset);
  }

  _setValue_unbound(sourceArray: NumberArray, offset: number) {
    this.bind();
    this.setValue(sourceArray, offset);
  }

  // create getter / setter pair for a property in the scene graph
  bind() {
    let targetObject: any = this.node;
    const parsedPath = this.parsedPath;

    const objectName = parsedPath.objectName;
    const propertyName = parsedPath.propertyName;
    let propertyIndex = parsedPath.propertyIndex;

    if (!targetObject) {
      targetObject = PropertyBinding.findNode(this.rootNode, parsedPath.nodeName);

      this.node = targetObject;
    }

    // set fail state, so we can just 'return' on error
    this.getValue = this._getValue_unavailable;
    this.setValue = this._setValue_unavailable;

    // ensure there is a value node
    if (!targetObject) {
      console.warn('THREE.PropertyBinding: No target node found for track: ' + this.path + '.');
      return;
    }

    if (objectName) {
      let objectIndex = +parsedPath.objectIndex;

      // special cases were we need to reach deeper into the hierarchy to get the face materials....
      switch (objectName) {
        case 'materials':
          if (!targetObject.material) {
            console.error('THREE.PropertyBinding: Can not bind to material as node does not have a material.', this);
            return;
          }

          if (!targetObject.material.materials) {
            console.error(
              'THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.',
              this,
            );
            return;
          }

          targetObject = targetObject.material.materials;

          break;

        case 'bones':
          if (!targetObject.skeleton) {
            console.error('THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.', this);
            return;
          }

          // potential future optimization: skip this if propertyIndex is already an integer
          // and convert the integer string to a true integer.

          targetObject = targetObject.skeleton.bones;

          // support resolving morphTarget names into indices.
          for (let i = 0; i < targetObject.length; i++) {
            if (targetObject[i].name === objectIndex) {
              objectIndex = i;
              break;
            }
          }

          break;

        case 'map':
          if ('map' in targetObject) {
            targetObject = targetObject.map;
            break;
          }

          if (!targetObject.material) {
            console.error('THREE.PropertyBinding: Can not bind to material as node does not have a material.', this);
            return;
          }

          if (!targetObject.material.map) {
            console.error(
              'THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.',
              this,
            );
            return;
          }

          targetObject = targetObject.material.map;
          break;

        default:
          if (targetObject[objectName] === undefined) {
            console.error('THREE.PropertyBinding: Can not bind to objectName of node undefined.', this);
            return;
          }

          targetObject = targetObject[objectName];
      }

      if (objectIndex !== undefined) {
        if (targetObject[objectIndex] === undefined) {
          console.error(
            'THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.',
            this,
            targetObject,
          );
          return;
        }

        targetObject = targetObject[objectIndex];
      }
    }

    // resolve property
    const nodeProperty = targetObject[propertyName];

    if (nodeProperty === undefined) {
      const nodeName = parsedPath.nodeName;

      console.error(
        'THREE.PropertyBinding: Trying to update property for track: ' +
          nodeName +
          '.' +
          propertyName +
          " but it wasn't found.",
        targetObject,
      );
      return;
    }

    // determine versioning scheme
    let versioning = this.Versioning.None;

    this.targetObject = targetObject;

    if (targetObject.needsUpdate !== undefined) {
      // material

      versioning = this.Versioning.NeedsUpdate;
    } else if (targetObject.matrixWorldNeedsUpdate !== undefined) {
      // node transform

      versioning = this.Versioning.MatrixWorldNeedsUpdate;
    }

    // determine how the property gets bound
    let bindingType = this.BindingType.Direct;

    if (propertyIndex !== undefined) {
      // access a sub element of the property array (only primitives are supported right now)

      if (propertyName === 'morphTargetInfluences') {
        // potential optimization, skip this if propertyIndex is already an integer, and convert the integer string to a true integer.

        // support resolving morphTarget names into indices.
        if (!targetObject.geometry) {
          console.error(
            'THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.',
            this,
          );
          return;
        }

        if (!targetObject.geometry.morphAttributes) {
          console.error(
            'THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.',
            this,
          );
          return;
        }

        if (targetObject.morphTargetDictionary[propertyIndex] !== undefined) {
          propertyIndex = targetObject.morphTargetDictionary[propertyIndex];
        }
      }

      bindingType = this.BindingType.ArrayElement;

      this.resolvedProperty = nodeProperty;
      this.propertyIndex = propertyIndex;
    } else if (nodeProperty.fromArray !== undefined && nodeProperty.toArray !== undefined) {
      // must use copy for Object3D.Euler/Quaternion

      bindingType = this.BindingType.HasFromToArray;

      this.resolvedProperty = nodeProperty;
    } else if (Array.isArray(nodeProperty)) {
      bindingType = this.BindingType.EntireArray;

      this.resolvedProperty = nodeProperty;
    } else {
      this.propertyName = propertyName;
    }

    // select getter / setter
    this.getValue = this.GetterByBindingType[bindingType];
    this.setValue = this.SetterByBindingTypeAndVersioning[bindingType][versioning];
  }

  unbind() {
    this.node = null;

    // back to the prototype version of getValue / setValue
    // note: avoiding to mutate the shape of 'this' via 'delete'
    this.getValue = this._getValue_unbound;
    this.setValue = this._setValue_unbound;
  }
}
PropertyBinding.prototype.BindingType = {
  Direct: 0,
  EntireArray: 1,
  ArrayElement: 2,
  HasFromToArray: 3,
};
PropertyBinding.prototype.Versioning = {
  None: 0,
  NeedsUpdate: 1,
  MatrixWorldNeedsUpdate: 2,
};
PropertyBinding.prototype.GetterByBindingType = [
  PropertyBinding.prototype._getValue_direct,
  PropertyBinding.prototype._getValue_array,
  PropertyBinding.prototype._getValue_arrayElement,
  PropertyBinding.prototype._getValue_toArray,
];
PropertyBinding.prototype.SetterByBindingTypeAndVersioning = [
  [
    // Direct
    PropertyBinding.prototype._setValue_direct,
    PropertyBinding.prototype._setValue_direct_setNeedsUpdate,
    PropertyBinding.prototype._setValue_direct_setMatrixWorldNeedsUpdate,
  ],
  [
    // EntireArray

    PropertyBinding.prototype._setValue_array,
    PropertyBinding.prototype._setValue_array_setNeedsUpdate,
    PropertyBinding.prototype._setValue_array_setMatrixWorldNeedsUpdate,
  ],
  [
    // ArrayElement
    PropertyBinding.prototype._setValue_arrayElement,
    PropertyBinding.prototype._setValue_arrayElement_setNeedsUpdate,
    PropertyBinding.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate,
  ],
  [
    // HasToFromArray
    PropertyBinding.prototype._setValue_fromArray,
    PropertyBinding.prototype._setValue_fromArray_setNeedsUpdate,
    PropertyBinding.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate,
  ],
];
