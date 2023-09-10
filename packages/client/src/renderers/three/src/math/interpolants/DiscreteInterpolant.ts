import { Interpolant } from './Interpolant.js';

export namespace DiscreteInterpolant {
  export const create = (options: Interpolant.Parameters) => {
    const interpolantOptions = options as Interpolant.Options;
    interpolantOptions.interpolate = (interpolant, i1) => interpolant.sampleAt(i1 - 1);

    return Interpolant.create(interpolantOptions);
  };
}
