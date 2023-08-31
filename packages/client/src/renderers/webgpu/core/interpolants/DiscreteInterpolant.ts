import { Interpolant } from '../Interpolant.js';
import { TypedArray } from '../types.js';

export class DiscreteInterpolant extends Interpolant {
  constructor(parameterPositions: number[], sampleValues: TypedArray, sampleSize: number, resultBuffer: TypedArray) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);
  }

  interpolate_ = (i1: number) => this.copySampleValue_(i1 - 1);
}
