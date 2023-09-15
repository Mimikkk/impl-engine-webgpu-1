import { KeyframeTrack } from './KeyframeTrack.js';

/**
 * A Track of numeric keyframe values.
 */
export class NumberKeyframeTrack extends KeyframeTrack {}
NumberKeyframeTrack.prototype.ValueTypeName = 'number';
