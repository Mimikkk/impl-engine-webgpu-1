import { Interpolant } from '../Interpolant.js';
import { NumberArray } from '../types.js';

export class DiscreteInterpolant extends Interpolant {
  constructor(
    parameterPositions: NumberArray,
    sampleValues: NumberArray,
    sampleSize: number,
    resultBuffer: NumberArray,
  ) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);
  }

  interpolate_ = (i1: number) => this.copySampleValue_(i1 - 1);
}
