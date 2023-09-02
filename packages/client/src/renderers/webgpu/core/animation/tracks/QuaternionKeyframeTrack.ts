import { InterpolateLinear } from '../../../common/Constants.js';
import { KeyframeTrack } from './KeyframeTrack.js';
import { QuaternionLinearInterpolant } from '../../interpolants/QuaternionLinearInterpolant.js';
import { Interpolant } from '../../Interpolant.js';
import { NumberArray } from '../../types.js';

export class QuaternionKeyframeTrack extends KeyframeTrack {
  InterpolantFactoryMethodLinear = (result: NumberArray): Interpolant => {
    return new QuaternionLinearInterpolant(this.times, this.values, this.getValueSize(), result);
  };
}
QuaternionKeyframeTrack.prototype.ValueTypeName = 'quaternion';
QuaternionKeyframeTrack.prototype.ValueBufferType = Array;
QuaternionKeyframeTrack.prototype.DefaultInterpolation = InterpolateLinear;
