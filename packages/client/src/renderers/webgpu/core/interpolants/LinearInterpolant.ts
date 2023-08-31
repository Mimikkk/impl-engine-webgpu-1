import { Interpolant } from '../Interpolant.js';
import { TypedArray } from '../types.js';

export class LinearInterpolant extends Interpolant {
  constructor(parameterPositions: number[], sampleValues: TypedArray, sampleSize: number, resultBuffer: TypedArray) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);
  }

  interpolate_(i1: number, t0: number, t: number, t1: number): TypedArray {
    const result = this.resultBuffer,
      values = this.sampleValues,
      stride = this.valueSize,
      offset1 = i1 * stride,
      offset0 = offset1 - stride,
      weight1 = (t - t0) / (t1 - t0),
      weight0 = 1 - weight1;

    for (let i = 0; i !== stride; ++i) {
      result[i] = values[offset0 + i] * weight0 + values[offset1 + i] * weight1;
    }

    return result;
  }
}
