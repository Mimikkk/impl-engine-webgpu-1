import { InterpolateLinear } from '../../constants.js';
import { KeyframeTrack } from './KeyframeTrack.js';
import { QuaternionLinearInterpolant } from '../../math/interpolants/QuaternionLinearInterpolant.js';
import { NumberArray } from '../../../../webgpu/core/types.js';

export class QuaternionKeyframeTrack extends KeyframeTrack {
  InterpolantFactoryMethodLinear(result?: NumberArray) {
    return QuaternionLinearInterpolant.create({
      positions: this.times,
      samples: this.values,
      stride: this.stride,
      result,
    });
  }
}

QuaternionKeyframeTrack.prototype.ValueTypeName = 'quaternion';
QuaternionKeyframeTrack.prototype.DefaultInterpolation = InterpolateLinear;
QuaternionKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;
