import { InterpolateDiscrete, InterpolateLinear, InterpolateSmooth } from '../../../common/Constants.js';
import { CubicInterpolant } from '../../interpolants/CubicInterpolant.js';
import { LinearInterpolant } from '../../interpolants/LinearInterpolant.js';
import { DiscreteInterpolant } from '../../interpolants/DiscreteInterpolant.js';
import * as AnimationUtils from '../AnimationUtils.js';
import { NumberArray, NumberArrayConstructor, TypedArray } from '../../types.js';
import { Interpolant } from '../../Interpolant.js';

type CreateInterpolateFn = (result: TypedArray) => Interpolant;

export class KeyframeTrack {
  declare ['constructor']: typeof KeyframeTrack;
  name: string;
  values: NumberArray;
  times: NumberArray;
  TimeBufferType: NumberArrayConstructor;
  ValueBufferType: NumberArrayConstructor;
  DefaultInterpolation: number;
  createInterpolant: CreateInterpolateFn;
  ValueTypeName: string;

  constructor(name: string, times: number[], values: number[], interpolation?: number) {
    this.name = name;
    this.times = AnimationUtils.convertArray(times, this.TimeBufferType);
    this.values = AnimationUtils.convertArray(values, this.ValueBufferType);

    this.createInterpolant = this.mapInterpolation(interpolation || this.DefaultInterpolation);
  }

  static toJSON(track: KeyframeTrack): {
    name: string;
    times: number[];
    values: number[];
    interpolation?: number;
    type: string;
  } {
    const json: {
      name: string;
      times: number[];
      values: number[];
      interpolation?: number;
      type: string;
    } = {
      name: track.name,
      times: AnimationUtils.convertArray(track.times, Array),
      values: AnimationUtils.convertArray(track.values, Array),
      interpolation: track.getInterpolation(),
      type: track.ValueTypeName,
    };
    if (json.interpolation === track.DefaultInterpolation) delete json.interpolation;

    return json;
  }

  InterpolantFactoryMethodDiscrete: CreateInterpolateFn | undefined = result =>
    new DiscreteInterpolant(this.times, this.values, this.getValueSize(), result);
  InterpolantFactoryMethodLinear: CreateInterpolateFn | undefined = result =>
    new LinearInterpolant(this.times, this.values, this.getValueSize(), result);
  InterpolantFactoryMethodSmooth: CreateInterpolateFn | undefined = result =>
    new CubicInterpolant(this.times, this.values, this.getValueSize(), result);

  mapInterpolation(interpolation: number): CreateInterpolateFn {
    switch (interpolation) {
      case InterpolateDiscrete:
        return this.InterpolantFactoryMethodDiscrete!;
      case InterpolateLinear:
        return this.InterpolantFactoryMethodLinear!;
      case InterpolateSmooth:
        return this.InterpolantFactoryMethodSmooth!;
      default:
        return this.mapInterpolation(this.DefaultInterpolation);
    }
  }

  getInterpolation() {
    switch (this.createInterpolant) {
      case this.InterpolantFactoryMethodDiscrete:
        return InterpolateDiscrete;
      case this.InterpolantFactoryMethodLinear:
        return InterpolateLinear;
      case this.InterpolantFactoryMethodSmooth:
        return InterpolateSmooth;
      default:
        return this.DefaultInterpolation;
    }
  }

  getValueSize() {
    return this.values.length / this.times.length;
  }

  shift(offsetMs: number) {
    if (offsetMs !== 0.0) {
      const times = this.times;

      for (let i = 0, n = times.length; i !== n; ++i) {
        times[i] += offsetMs;
      }
    }

    return this;
  }

  scale(scale: number) {
    if (scale !== 1.0) {
      const times = this.times;

      for (let i = 0, n = times.length; i !== n; ++i) {
        times[i] *= scale;
      }
    }

    return this;
  }

  trim(startMs: number, endMs: number) {
    const times = this.times;
    const nKeys = times.length;

    let from = 0;
    let to = nKeys - 1;

    while (from !== nKeys && times[from] < startMs) ++from;
    while (to !== -1 && times[to] > endMs) --to;

    // empty tracks are forbidden, so keep at least one keyframe
    if (from !== 0 || to !== nKeys) {
      if (from >= to) {
        to = Math.max(to, 1);
        from = to - 1;
      }

      const stride = this.getValueSize();
      this.times = AnimationUtils.arraySlice(times, from, to);
      this.values = AnimationUtils.arraySlice(this.values, from * stride, to * stride);
    }

    return this;
  }

  // ensure we do not get a GarbageInGarbageOut situation, make sure tracks are at least minimally viable
  validate() {
    let valid = true;

    const valueSize = this.getValueSize();
    if (valueSize - Math.floor(valueSize) !== 0) {
      console.error('THREE.KeyframeTrack: Invalid value size in track.', this);
      valid = false;
    }

    const times = this.times,
      values = this.values,
      nKeys = times.length;

    if (nKeys === 0) {
      console.error('THREE.KeyframeTrack: Track is empty.', this);
      valid = false;
    }

    let prevTime = null;

    for (let i = 0; i !== nKeys; i++) {
      const currTime = times[i];

      if (typeof currTime === 'number' && isNaN(currTime)) {
        console.error('THREE.KeyframeTrack: Time is not a valid number.', this, i, currTime);
        valid = false;
        break;
      }

      if (prevTime !== null && prevTime > currTime) {
        console.error('THREE.KeyframeTrack: Out of order keys.', this, i, currTime, prevTime);
        valid = false;
        break;
      }

      prevTime = currTime;
    }

    if (values !== undefined) {
      if (AnimationUtils.isTypedArray(values)) {
        for (let i = 0, n = values.length; i !== n; ++i) {
          const value = values[i];

          if (isNaN(value)) {
            console.error('THREE.KeyframeTrack: Value is not a valid number.', this, i, value);
            valid = false;
            break;
          }
        }
      }
    }

    return valid;
  }

  // removes equivalent sequential keys as common in morph target sequences
  // (0,0,0,0,1,1,1,0,0,0,0,0,0,0) --> (0,0,1,1,0,0)
  optimize() {
    // times or values may be shared with other tracks, so overwriting is unsafe
    const times = AnimationUtils.arraySlice(this.times),
      values = AnimationUtils.arraySlice(this.values),
      stride = this.getValueSize(),
      smoothInterpolation = this.getInterpolation() === InterpolateSmooth,
      lastIndex = times.length - 1;

    let writeIndex = 1;

    for (let i = 1; i < lastIndex; ++i) {
      let keep = false;

      const time = times[i];
      const timeNext = times[i + 1];

      // remove adjacent keyframes scheduled at the same time

      if (time !== timeNext && (i !== 1 || time !== times[0])) {
        if (!smoothInterpolation) {
          // remove unnecessary keyframes same as their neighbors

          const offset = i * stride,
            offsetP = offset - stride,
            offsetN = offset + stride;

          for (let j = 0; j !== stride; ++j) {
            const value = values[offset + j];

            if (value !== values[offsetP + j] || value !== values[offsetN + j]) {
              keep = true;
              break;
            }
          }
        } else {
          keep = true;
        }
      }

      // in-place compaction

      if (keep) {
        if (i !== writeIndex) {
          times[writeIndex] = times[i];

          const readOffset = i * stride,
            writeOffset = writeIndex * stride;

          for (let j = 0; j !== stride; ++j) {
            values[writeOffset + j] = values[readOffset + j];
          }
        }

        ++writeIndex;
      }
    }

    // flush last keyframe (compaction looks ahead)

    if (lastIndex > 0) {
      times[writeIndex] = times[lastIndex];

      for (let readOffset = lastIndex * stride, writeOffset = writeIndex * stride, j = 0; j !== stride; ++j) {
        values[writeOffset + j] = values[readOffset + j];
      }

      ++writeIndex;
    }

    if (writeIndex !== times.length) {
      this.times = AnimationUtils.arraySlice(times, 0, writeIndex);
      this.values = AnimationUtils.arraySlice(values, 0, writeIndex * stride);
    } else {
      this.times = times;
      this.values = values;
    }

    return this;
  }

  clone(): KeyframeTrack {
    const times = AnimationUtils.arraySlice(this.times);
    const values = AnimationUtils.arraySlice(this.values);
    const track = new this.constructor(this.name, times, values);
    track.createInterpolant = this.createInterpolant;

    return track;
  }
}

KeyframeTrack.prototype.TimeBufferType = Float32Array;
KeyframeTrack.prototype.ValueBufferType = Float32Array;
KeyframeTrack.prototype.DefaultInterpolation = InterpolateLinear;
