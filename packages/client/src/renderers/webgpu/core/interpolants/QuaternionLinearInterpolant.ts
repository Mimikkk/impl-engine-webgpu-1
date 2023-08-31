import { Interpolant } from '../Interpolant.js';
import { Quaternion } from '../Quaternion.js';
import { TypedArray } from '../types.js';

export class QuaternionLinearInterpolant extends Interpolant {
  constructor(parameterPositions: number[], sampleValues: TypedArray, sampleSize: number, resultBuffer: TypedArray) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);
  }

  interpolate_(i1: number, t0: number, t: number, t1: number): TypedArray {
    const result = this.resultBuffer;
    const values = this.sampleValues;
    const stride = this.valueSize;
    const alpha = (t - t0) / (t1 - t0);

    let offset = i1 * stride;

    for (let end = offset + stride; offset !== end; offset += 4) {
      Quaternion.slerpFlat(result, 0, values, offset - stride, values, offset, alpha);
    }

    return result;
  }
}
