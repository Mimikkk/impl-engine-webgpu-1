import { Interpolant } from './Interpolant.js';
import { Quaternion } from '../Quaternion.js';

export namespace QuaternionLinearInterpolant {
  export const create = (options: Interpolant.Parameters) => {
    const interpolantOptions = options as Interpolant.Options;
    interpolantOptions.interpolate = ({ result, samples, stride }, i1, t0, t, t1) => {
      const alpha = (t - t0) / (t1 - t0);

      let offset = i1 * stride;

      for (let end = offset + stride; offset !== end; offset += 4) {
        Quaternion.slerpFlat(result, 0, samples, offset - stride, samples, offset, alpha);
      }

      return result;
    };

    return Interpolant.create(interpolantOptions);
  };
}
