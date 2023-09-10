import { WrapAroundEnding, ZeroCurvatureEnding, ZeroSlopeEnding } from '../../constants.js';
import { Interpolant } from './Interpolant.js';

export namespace CubicInterpolant {
  export type Ending = typeof ZeroCurvatureEnding | typeof ZeroSlopeEnding | typeof WrapAroundEnding;

  interface Options extends Interpolant.Parameters {
    ending?: { start?: Ending; end?: Ending };
  }

  export const create = ({ ending = {}, samples, stride, result, positions, index }: Options) => {
    ending.start ??= ZeroCurvatureEnding;
    ending.end ??= ZeroCurvatureEnding;

    let weightPrevious: number = 0;
    let weightNext: number = 0;
    let offsetPrevious: number = 0;
    let offsetNext: number = 0;

    return Interpolant.create({
      positions,
      samples,
      stride,
      result,
      index,
      interpolate: ({ result, samples, stride }, i1, t0, t, t1) => {
        const o1 = i1 * stride;
        const o0 = o1 - stride;
        const oP = offsetPrevious;
        const oN = offsetNext;
        const wP = weightPrevious;
        const wN = weightNext;
        const p = (t - t0) / (t1 - t0);
        const pp = p * p;
        const ppp = pp * p;

        const sP = -wP * ppp + 2 * wP * pp - wP * p;
        const s0 = (1 + wP) * ppp + (-1.5 - 2 * wP) * pp + (-0.5 + wP) * p + 1;
        const s1 = (-1 - wN) * ppp + (1.5 + wN) * pp + 0.5 * p;
        const sN = wN * ppp - wN * pp;

        for (let i = 0; i !== stride; ++i)
          result[i] = sP * samples[oP + i] + s0 * samples[o0 + i] + s1 * samples[o1 + i] + sN * samples[oN + i];

        return result;
      },
      validate: ({ positions, stride }, i1, t0, t1) => {
        let previousIndex = i1 - 2;
        let nextIndex = i1 + 1;
        let previous = positions[previousIndex];
        let next = positions[nextIndex];

        if (previous === undefined) {
          switch (ending.start) {
            case ZeroSlopeEnding:
              previousIndex = i1;
              previous = 2 * t0 - t1;
              break;
            case WrapAroundEnding:
              previousIndex = positions.length - 2;
              previous = t0 + positions[previousIndex] - positions[previousIndex + 1];
              break;
            case ZeroCurvatureEnding:
              previousIndex = i1;
              previous = t1;
              break;
          }
        }
        if (next === undefined) {
          switch (ending.end) {
            case ZeroSlopeEnding:
              nextIndex = i1;
              next = 2 * t1 - t0;
              break;
            case WrapAroundEnding:
              nextIndex = 1;
              next = t1 + positions[1] - positions[0];
              break;
            case ZeroCurvatureEnding:
              nextIndex = i1 - 1;
              next = t0;
              break;
          }
        }

        const halfDt = (t1 - t0) * 0.5;

        weightPrevious = halfDt / (t0 - previous);
        offsetPrevious = previousIndex * stride;
        weightNext = halfDt / (next - t1);
        offsetNext = nextIndex * stride;
      },
    });
  };
}
