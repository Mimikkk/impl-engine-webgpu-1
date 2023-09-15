import { Quaternion } from '../math/Quaternion.js';
import { PropertyBinding } from './PropertyBinding.js';
import { NumberArray } from '../../../webgpu/core/types.js';

export class PropertyMixer {
  binding: PropertyBinding;
  valueSize: number;
  buffer: NumberArray;
  cumulativeWeight: number;
  cumulativeWeightAdditive: number;
  useCount: number;
  referenceCount: number;
  _mixBufferRegion: Function;
  _mixBufferRegionAdditive: Function;
  _setIdentity: Function;
  _origIndex: number;
  _addIndex: number;
  _workIndex: number;

  constructor(binding: PropertyBinding, typeName: string, valueSize: number) {
    this.binding = binding;
    this.valueSize = valueSize;

    let mixFunction, mixFunctionAdditive, setIdentity;

    switch (typeName) {
      case 'quaternion':
        mixFunction = this._slerp;
        mixFunctionAdditive = this._slerpAdditive;
        setIdentity = this._setAdditiveIdentityQuaternion;

        this.buffer = new Float64Array(valueSize * 6);
        this._workIndex = 5;
        break;

      case 'string':
      case 'bool':
        mixFunction = this._select;

        // Use the regular mix function and for additive on these types,
        // additive is not relevant for non-numeric types
        mixFunctionAdditive = this._select;

        setIdentity = this._setAdditiveIdentityOther;

        this.buffer = new Array(valueSize * 5);
        break;

      default:
        mixFunction = this._lerp;
        mixFunctionAdditive = this._lerpAdditive;
        setIdentity = this._setAdditiveIdentityNumeric;

        this.buffer = new Float64Array(valueSize * 5);
    }

    this._mixBufferRegion = mixFunction;
    this._mixBufferRegionAdditive = mixFunctionAdditive;
    this._setIdentity = setIdentity;
    this._origIndex = 3;
    this._addIndex = 4;

    this.cumulativeWeight = 0;
    this.cumulativeWeightAdditive = 0;

    this.useCount = 0;
    this.referenceCount = 0;
  }
  accumulate(accuIndex: number, weight: number): void {
    // note: happily accumulating nothing when weight = 0, the caller knows
    // the weight and shouldn't have made the call in the first place

    const buffer = this.buffer,
      stride = this.valueSize,
      offset = accuIndex * stride + stride;

    let currentWeight = this.cumulativeWeight;

    if (currentWeight === 0) {
      // accuN := incoming * weight

      for (let i = 0; i !== stride; ++i) {
        buffer[offset + i] = buffer[i];
      }

      currentWeight = weight;
    } else {
      // accuN := accuN + incoming * weight

      currentWeight += weight;
      const mix = weight / currentWeight;
      this._mixBufferRegion(buffer, offset, 0, mix, stride);
    }

    this.cumulativeWeight = currentWeight;
  }
  accumulateAdditive(weight: number): void {
    const buffer = this.buffer,
      stride = this.valueSize,
      offset = stride * this._addIndex;

    if (this.cumulativeWeightAdditive === 0) {
      // add = identity

      this._setIdentity();
    }

    // add := add + incoming * weight

    this._mixBufferRegionAdditive(buffer, offset, 0, weight, stride);
    this.cumulativeWeightAdditive += weight;
  }
  apply(accuIndex: number): void {
    const stride = this.valueSize,
      buffer = this.buffer,
      offset = accuIndex * stride + stride,
      weight = this.cumulativeWeight,
      weightAdditive = this.cumulativeWeightAdditive,
      binding = this.binding;

    this.cumulativeWeight = 0;
    this.cumulativeWeightAdditive = 0;

    if (weight < 1) {
      // accuN := accuN + original * ( 1 - cumulativeWeight )

      const originalValueOffset = stride * this._origIndex;

      this._mixBufferRegion(buffer, offset, originalValueOffset, 1 - weight, stride);
    }

    if (weightAdditive > 0) {
      // accuN := accuN + additive accuN

      this._mixBufferRegionAdditive(buffer, offset, this._addIndex * stride, 1, stride);
    }

    for (let i = stride, e = stride + stride; i !== e; ++i) {
      if (buffer[i] !== buffer[i + stride]) {
        // value has changed -> update scene graph

        binding.setValue(buffer, offset);
        break;
      }
    }
  }
  saveOriginalState(): void {
    const binding = this.binding;

    const buffer = this.buffer,
      stride = this.valueSize,
      originalValueOffset = stride * this._origIndex;

    binding.getValue(buffer, originalValueOffset);

    // accu[0..1] := orig -- initially detect changes against the original
    for (let i = stride, e = originalValueOffset; i !== e; ++i) {
      buffer[i] = buffer[originalValueOffset + (i % stride)];
    }

    // Add to identity for additive
    this._setIdentity();

    this.cumulativeWeight = 0;
    this.cumulativeWeightAdditive = 0;
  }
  restoreOriginalState(): void {
    const originalValueOffset = this.valueSize * 3;
    this.binding.setValue(this.buffer, originalValueOffset);
  }
  _setAdditiveIdentityNumeric(): void {
    const startIndex = this._addIndex * this.valueSize;
    const endIndex = startIndex + this.valueSize;

    for (let i = startIndex; i < endIndex; i++) {
      this.buffer[i] = 0;
    }
  }
  _setAdditiveIdentityQuaternion(): void {
    this._setAdditiveIdentityNumeric();
    this.buffer[this._addIndex * this.valueSize + 3] = 1;
  }
  _setAdditiveIdentityOther(): void {
    const startIndex = this._origIndex * this.valueSize;
    const targetIndex = this._addIndex * this.valueSize;

    for (let i = 0; i < this.valueSize; i++) {
      this.buffer[targetIndex + i] = this.buffer[startIndex + i];
    }
  }

  _select(buffer: NumberArray, dstOffset: number, srcOffset: number, t: number, stride: number): void {
    if (t >= 0.5) {
      for (let i = 0; i !== stride; ++i) {
        buffer[dstOffset + i] = buffer[srcOffset + i];
      }
    }
  }
  _slerp(buffer: NumberArray, dstOffset: number, srcOffset: number, t: number): void {
    Quaternion.slerpFlat(buffer, dstOffset, buffer, dstOffset, buffer, srcOffset, t);
  }
  _slerpAdditive(buffer: NumberArray, dstOffset: number, srcOffset: number, t: number, stride: number): void {
    const workOffset = this._workIndex * stride;

    // Store result in intermediate buffer offset
    Quaternion.multiplyQuaternionsFlat(buffer, workOffset, buffer, dstOffset, buffer, srcOffset);

    // Slerp to the intermediate result
    Quaternion.slerpFlat(buffer, dstOffset, buffer, dstOffset, buffer, workOffset, t);
  }
  _lerp(buffer: NumberArray, dstOffset: number, srcOffset: number, t: number, stride: number): void {
    const s = 1 - t;

    for (let i = 0; i !== stride; ++i) {
      const j = dstOffset + i;

      buffer[j] = buffer[j] * s + buffer[srcOffset + i] * t;
    }
  }
  _lerpAdditive(buffer: NumberArray, dstOffset: number, srcOffset: number, t: number, stride: number): void {
    for (let i = 0; i !== stride; ++i) {
      const j = dstOffset + i;

      buffer[j] = buffer[j] + buffer[srcOffset + i] * t;
    }
  }
}
