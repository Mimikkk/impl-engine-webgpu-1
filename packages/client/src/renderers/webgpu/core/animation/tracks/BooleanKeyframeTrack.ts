import { InterpolateDiscrete } from '../../../common/Constants.js';
import { KeyframeTrack } from './KeyframeTrack.js';

export class BooleanKeyframeTrack extends KeyframeTrack {}

BooleanKeyframeTrack.prototype.ValueTypeName = 'bool';
BooleanKeyframeTrack.prototype.ValueBufferType = Array;
BooleanKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
BooleanKeyframeTrack.prototype.InterpolantFactoryMethodLinear = undefined;
BooleanKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;
