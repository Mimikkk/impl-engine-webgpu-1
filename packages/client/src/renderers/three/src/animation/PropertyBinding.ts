import { AnimationObjectGroup } from './AnimationObjectGroup.js';
import { NumberArray } from '../../../webgpu/core/types.js';
import { Object3D } from '../core/Object3D.js';
const _RESERVED_CHARS_RE = '\\[\\]\\.:\\/';
const _reservedRe = new RegExp('[' + _RESERVED_CHARS_RE + ']', 'g');
const _wordChar = '[^' + _RESERVED_CHARS_RE + ']';
const _wordCharOrDot = '[^' + _RESERVED_CHARS_RE.replace('\\.', '') + ']';
const _directoryRe = /((?:WC+[\/:])*)/.source.replace('WC', _wordChar);
const _nodeRe = /(WCOD+)?/.source.replace('WCOD', _wordCharOrDot);
const _objectRe = /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace('WC', _wordChar);
const _propertyRe = /\.(WC+)(?:\[(.+)\])?/.source.replace('WC', _wordChar);
const _trackRe = new RegExp('' + '^' + _directoryRe + _nodeRe + _objectRe + _propertyRe + '$');
const _supportedObjectNames = ['material', 'materials', 'bones', 'map'];

export interface ParseTrackNameResults {
  nodeName: string;
  objectName: string;
  objectIndex: string;
  propertyName: string;
  propertyIndex: string;
}

export type GetValue = (targetArray: NumberArray, offset: number) => void;
export type SetValue = (sourceArray: NumberArray, offset: number) => void;

class Composite {
  declare _targetGroup: AnimationObjectGroup;
  declare _bindings: PropertyBinding[];

  constructor(targetGroup: any, path: string, optionalParsedPath?: ParseTrackNameResults) {
    const parsedPath = optionalParsedPath || PropertyBinding.parseTrackName(path);
    this._targetGroup = targetGroup;
    this._bindings = targetGroup.subscribe_(path, parsedPath);
  }

  getValue(array: NumberArray, offset: number) {
    this.bind();
    const firstValidIndex = this._targetGroup.nCachedObjects_;
    const binding = this._bindings[firstValidIndex];
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

export class PropertyBinding {
  static Composite = Composite;
  BindingType: Record<string, number>;
  Versioning: Record<string, number>;
  GetterByBindingType: GetValue[];
  SetterByBindingTypeAndVersioning: SetValue[][];
  path: string;
  parsedPath: ParseTrackNameResults;
  node: any;
  rootNode: any;
  targetObject: Object3D;
  propertyName: string;
  resolvedProperty: any;
  propertyIndex: number;

  getValue: GetValue = () => {};
  setValue: SetValue = () => {};

  constructor(rootNode: Object3D, path: string, parsedPath?: ParseTrackNameResults) {
    this.path = path;
    this.parsedPath = parsedPath || PropertyBinding.parseTrackName(path);
    this.node = PropertyBinding.findNode(rootNode, this.parsedPath.nodeName);
    this.rootNode = rootNode;

    this.getValue = this._getValue_unbound;
    this.setValue = this._setValue_unbound;
  }

  static create(root: Object3D, path: string, parsedPath?: ParseTrackNameResults) {
    if (!(root && AnimationObjectGroup.is(root))) {
      return new PropertyBinding(root, path, parsedPath);
    } else {
      return new PropertyBinding.Composite(root, path, parsedPath);
    }
  }

  static sanitizeNodeName(name: string): string {
    return name.replace(/\s/g, '_').replace(_reservedRe, '');
  }

  static parseTrackName(trackName: string): ParseTrackNameResults {
    const matches = _trackRe.exec(trackName);

    if (matches === null) {
      throw new Error('PropertyBinding: Cannot parse trackName: ' + trackName);
    }

    const results: ParseTrackNameResults = {
      nodeName: matches[2],
      objectName: matches[3],
      objectIndex: matches[4],
      propertyName: matches[5],
      propertyIndex: matches[6],
    };

    const lastDot = results.nodeName?.lastIndexOf('.');

    if (lastDot !== undefined && lastDot !== -1) {
      const objectName = results.nodeName.substring(lastDot + 1);

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

  static findNode(root: Object3D, nodeName: number | string): Object3D | null {
    if (
      nodeName === undefined ||
      nodeName === '' ||
      nodeName === '.' ||
      nodeName === -1 ||
      nodeName === root.name ||
      nodeName === root.uuid
    )
      return root;

    if (root.skeleton) {
      const bone = root.skeleton.getBoneByName(nodeName as string);

      if (bone !== undefined) return bone;
    }
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

  _getValue_unavailable(): void {}
  _setValue_unavailable(): void {}
  _getValue_direct(buffer: NumberArray, offset: number): void {
    buffer[offset] = this.targetObject[this.propertyName as never];
  }
  _getValue_array(buffer: NumberArray, offset: number): void {
    const source = this.resolvedProperty;

    for (let i = 0, n = source.length; i !== n; ++i) {
      buffer[offset++] = source[i];
    }
  }
  _getValue_arrayElement(buffer: NumberArray, offset: number): void {
    buffer[offset] = this.resolvedProperty[this.propertyIndex];
  }
  _getValue_toArray(buffer: NumberArray, offset: number): void {
    this.resolvedProperty.toArray(buffer, offset);
  }
  _setValue_direct(buffer: NumberArray, offset: number): void {
    this.targetObject[this.propertyName as never] = buffer[offset] as never;
  }
  _setValue_direct_setNeedsUpdate(buffer: NumberArray, offset: number): void {
    this.targetObject[this.propertyName as never] = buffer[offset] as never;
    (this.targetObject as any).needsUpdate = true;
  }
  _setValue_direct_setMatrixWorldNeedsUpdate(buffer: NumberArray, offset: number): void {
    this.targetObject[this.propertyName as never] = buffer[offset] as never;
    this.targetObject.matrixWorldNeedsUpdate = true;
  }
  _setValue_array(buffer: NumberArray, offset: number): void {
    const dest = this.resolvedProperty;

    for (let i = 0, n = dest.length; i !== n; ++i) {
      dest[i] = buffer[offset++];
    }
  }
  _setValue_array_setNeedsUpdate(buffer: NumberArray, offset: number): void {
    const dest = this.resolvedProperty;

    for (let i = 0, n = dest.length; i !== n; ++i) {
      dest[i] = buffer[offset++];
    }

    (this.targetObject as any).needsUpdate = true;
  }
  _setValue_array_setMatrixWorldNeedsUpdate(buffer: NumberArray, offset: number): void {
    const dest = this.resolvedProperty;

    for (let i = 0, n = dest.length; i !== n; ++i) {
      dest[i] = buffer[offset++];
    }

    this.targetObject.matrixWorldNeedsUpdate = true;
  }
  _setValue_arrayElement(buffer: NumberArray, offset: number): void {
    this.resolvedProperty[this.propertyIndex] = buffer[offset];
  }
  _setValue_arrayElement_setNeedsUpdate(buffer: NumberArray, offset: number): void {
    this.resolvedProperty[this.propertyIndex] = buffer[offset];
    (this.targetObject as any).needsUpdate = true;
  }
  _setValue_arrayElement_setMatrixWorldNeedsUpdate(buffer: NumberArray, offset: number): void {
    this.resolvedProperty[this.propertyIndex] = buffer[offset];
    this.targetObject.matrixWorldNeedsUpdate = true;
  }
  _setValue_fromArray(buffer: NumberArray, offset: number): void {
    this.resolvedProperty.fromArray(buffer, offset);
  }
  _setValue_fromArray_setNeedsUpdate(buffer: NumberArray, offset: number): void {
    this.resolvedProperty.fromArray(buffer, offset);
    (this.targetObject as any).needsUpdate = true;
  }
  _setValue_fromArray_setMatrixWorldNeedsUpdate(buffer: NumberArray, offset: number): void {
    this.resolvedProperty.fromArray(buffer, offset);
    this.targetObject.matrixWorldNeedsUpdate = true;
  }
  _getValue_unbound(targetArray: NumberArray, offset: number): void {
    this.bind();
    this.getValue(targetArray, offset);
  }
  _setValue_unbound(sourceArray: NumberArray, offset: number): void {
    this.bind();
    this.setValue(sourceArray, offset);
  }

  bind() {
    let targetObject = this.node;
    const parsedPath = this.parsedPath;

    const objectName = parsedPath.objectName;
    const propertyName = parsedPath.propertyName;
    let propertyIndex = parsedPath.propertyIndex;

    if (!targetObject) {
      targetObject = PropertyBinding.findNode(this.rootNode, parsedPath.nodeName);

      this.node = targetObject;
    }

    // set fail state so we can just 'return' on error
    this.getValue = this._getValue_unavailable;
    this.setValue = this._setValue_unavailable;

    // ensure there is a value node
    if (!targetObject) {
      console.warn('THREE.PropertyBinding: No target node found for track: ' + this.path + '.');
      return;
    }

    if (objectName) {
      let objectIndex = parsedPath.objectIndex;

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
              objectIndex = `${i}`;
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
      this.propertyIndex = +propertyIndex;
    } else if (nodeProperty.fromArray !== undefined && nodeProperty.toArray !== undefined) {
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
