import { InterpolateDiscrete, InterpolateLinear, InterpolateSmooth } from '../../../common/Constants.js';
import { AnimationUtils } from '../AnimationUtils.js';
import { NumberArray, NumberArrayConstructor } from '../../types.js';
import { Interpolant } from '../../Interpolant.js';
import { DiscreteInterpolant } from '../../interpolants/DiscreteInterpolant.js';
import { LinearInterpolant } from '../../interpolants/LinearInterpolant.js';
import { CubicInterpolant } from '../../interpolants/CubicInterpolant.js';

export type InterpolationMode = typeof InterpolateDiscrete | typeof InterpolateLinear | typeof InterpolateSmooth;
type CreateInterpolateFn = (result: NumberArray) => Interpolant;

class KeyframeTrack {
  declare ['constructor']: new () => this;

  declare TimeBufferType: NumberArrayConstructor;
  declare ValueBufferType: NumberArrayConstructor;
  declare DefaultInterpolation: InterpolationMode;
  declare ValueTypeName: string;
  createInterpolant: CreateInterpolateFn | null;

  name: string;
  times: NumberArray;
  values: NumberArray;

  constructor(name: string, times: NumberArray, values: NumberArray, interpolation?: InterpolationMode) {
    this.name = name;
    this.times = AnimationUtils.convertArray(times, this.TimeBufferType);
    this.values = AnimationUtils.convertArray(values, this.ValueBufferType);

    this.setInterpolation(interpolation || this.DefaultInterpolation);
  }

  InterpolantFactoryMethodDiscrete(result: NumberArray) {
    return new DiscreteInterpolant(this.times, this.values, this.getValueSize(), result);
  }

  InterpolantFactoryMethodLinear(result: NumberArray) {
    return new LinearInterpolant(this.times, this.values, this.getValueSize(), result);
  }

  InterpolantFactoryMethodSmooth(result: NumberArray) {
    return new CubicInterpolant(this.times, this.values, this.getValueSize(), result);
  }

  setInterpolation(interpolation: InterpolationMode) {
    let factoryMethod;

    switch (interpolation) {
      case InterpolateDiscrete:
        factoryMethod = this.InterpolantFactoryMethodDiscrete;

        break;

      case InterpolateLinear:
        factoryMethod = this.InterpolantFactoryMethodLinear;

        break;

      case InterpolateSmooth:
        factoryMethod = this.InterpolantFactoryMethodSmooth;

        break;
    }

    if (factoryMethod === undefined) {
      const message = 'unsupported interpolation for ' + this.ValueTypeName + ' keyframe track named ' + this.name;

      if (this.createInterpolant === undefined) {
        // fall back to default, unless the default itself is messed up
        if (interpolation !== this.DefaultInterpolation) {
          this.setInterpolation(this.DefaultInterpolation);
        } else {
          throw new Error(message); // fatal, in this case
        }
      }

      console.warn('THREE.KeyframeTrack:', message);
      return this;
    }

    this.createInterpolant = factoryMethod;

    return this;
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

export { KeyframeTrack };
