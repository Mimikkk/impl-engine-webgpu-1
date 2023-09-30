import { Node } from '../core/Node.js';
import { addNodeElement, float, nodeProxy } from '../shadernode/ShaderNode.js';
import { EventDispatcher } from '../../Three.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

export class ScriptableValueNode extends Node {
  _value: any;
  _cache: any;
  inputType: any;
  outputType: any;
  events: any;
  isScriptableValueNode: boolean;

  constructor(value: any = null) {
    super();

    this._cache = null;

    this.inputType = null;
    this.outputType = null;

    this.events = new EventDispatcher();

    this.isScriptableValueNode = true;

    this._value = value;
  }
  get value() {
    return this._value;
  }

  set value(val) {
    if (this._value === val) return;

    if (this._cache && this.inputType === 'URL' && this.value.value instanceof ArrayBuffer) {
      URL.revokeObjectURL(this._cache);

      this._cache = null;
    }

    this._value = val;

    this.events.dispatchEvent({ type: 'change' });

    this.refresh();
  }

  get isScriptableOutputNode() {
    return this.outputType !== null;
  }

  refresh() {
    this.events.dispatchEvent({ type: 'refresh' });
  }

  getValue() {
    const value = this.value;

    if (value && this._cache === null && this.inputType === 'URL' && value.value instanceof ArrayBuffer) {
      this._cache = URL.createObjectURL(new Blob([value.value]));
    } else if (
      value &&
      value.value !== null &&
      value.value !== undefined &&
      (((this.inputType === 'URL' || this.inputType === 'String') && typeof value.value === 'string') ||
        (this.inputType === 'Number' && typeof value.value === 'number') ||
        (this.inputType === 'Vector2' && value.value.isVector2) ||
        (this.inputType === 'Vector3' && value.value.isVector3) ||
        (this.inputType === 'Vector4' && value.value.isVector4) ||
        (this.inputType === 'Color' && value.value.isColor) ||
        (this.inputType === 'Matrix3' && value.value.isMatrix3) ||
        (this.inputType === 'Matrix4' && value.value.isMatrix4))
    ) {
      return value.value;
    }

    return this._cache || value;
  }

  getNodeType(builder: NodeBuilder) {
    return this.value && this.value.isNode ? this.value.getNodeType(builder) : 'float';
  }

  construct() {
    return this.value && this.value.isNode ? this.value : float();
  }
}

export const scriptableValue = nodeProxy(ScriptableValueNode);

addNodeElement('scriptableValue', scriptableValue);
