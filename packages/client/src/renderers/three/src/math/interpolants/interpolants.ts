import { CubicInterpolant } from './CubicInterpolant.js';
import { DiscreteInterpolant } from './DiscreteInterpolant.js';
import { QuaternionLinearInterpolant } from './QuaternionLinearInterpolant.js';
import { LinearInterpolant } from './LinearInterpolant.js';

export namespace Interpolants {
  export const cubic = CubicInterpolant.create;
  export const discrete = DiscreteInterpolant.create;
  export const quaternion = QuaternionLinearInterpolant.create;
  export const linear = LinearInterpolant.create;
}
