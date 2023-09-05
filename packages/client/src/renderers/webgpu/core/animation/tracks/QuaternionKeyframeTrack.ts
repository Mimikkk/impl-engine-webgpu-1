import { InterpolateLinear } from '../../../common/Constants.js';
import { KeyframeTrack } from './KeyframeTrack.js';
import { QuaternionLinearInterpolant } from '../../interpolants/QuaternionLinearInterpolant.js';
import { NumberArray } from '../../types.js';
import { Interpolant } from '../../Interpolant.js';

export class QuaternionKeyframeTrack extends KeyframeTrack {
  InterpolantFactoryMethodLinear(result: NumberArray): Interpolant {
    return new QuaternionLinearInterpolant(this.times, this.values, this.getValueSize(), result);
  }
}

QuaternionKeyframeTrack.prototype.ValueTypeName = 'quaternion';
QuaternionKeyframeTrack.prototype.DefaultInterpolation = InterpolateLinear;
