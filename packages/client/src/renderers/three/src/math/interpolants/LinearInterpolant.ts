import { Interpolant } from './Interpolant.js';

export namespace LinearInterpolant {
  export interface Options extends Interpolant.Parameters {}

  export const create = (options: Options) => {
    const interpolateOptions = options as Interpolant.Options;
    interpolateOptions.interpolate = ({ result, samples, stride }, i1, t0, t, t1) => {
      const offsetNext = i1 * stride;
      const offsetPrevious = offsetNext - stride;
      const weightNext = (t - t0) / (t1 - t0);
      const weightPrevious = 1 - weightNext;

      for (let i = 0; i !== stride; ++i)
        result[i] = samples[offsetPrevious + i] * weightPrevious + samples[offsetNext + i] * weightNext;

      return result;
    };

    return Interpolant.create(interpolateOptions);
  };
}
