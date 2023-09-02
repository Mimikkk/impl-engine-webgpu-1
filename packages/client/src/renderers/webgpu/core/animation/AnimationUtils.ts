import { Quaternion } from '../Quaternion.js';
import { AdditiveAnimationBlendMode } from '../../common/Constants.js';
import { NumberArray, NumberArrayConstructor, TypedArray } from '../types.js';
import { AnimationClip } from './AnimationClip.js';

export function isTypedArray(array: NumberArray): array is TypedArray {
  return ArrayBuffer.isView(array);
}

export function arraySlice(array: NumberArray, from: number = 0, to: number = array.length) {
  if (isTypedArray(array)) {
    //@ts-expect-error
    return new array.constructor(array.subarray(from, to));
  }

  return array.slice(from, to);
}

export function convertArray(array: NumberArray, type: NumberArrayConstructor, forceClone?: boolean) {
  if (
    !array || // let 'undefined' and 'null' pass
    (!forceClone && array.constructor === type)
  )
    return array;

  if ('BYTES_PER_ELEMENT' in type && typeof type.BYTES_PER_ELEMENT === 'number') {
    return new type(array); // create typed array
  }

  return Array.prototype.slice.call(array);
}

// returns an array by which times and values can be sorted
export function getKeyframeOrder(times: NumberArray): NumberArray {
  const n = times.length;

  const result = new Array(n);

  for (let i = 0; i !== n; ++i) result[i] = i;

  return result.sort((a, b) => times[a] - times[b]);
}

export function sortedArray(values: NumberArray, stride: number, order: NumberArray): NumberArray {
  const nValues = values.length;
  //@ts-expect-error
  const result = new values.constructor(nValues);

  for (let i = 0, dstOffset = 0; dstOffset !== nValues; ++i) {
    const srcOffset = order[i] * stride;

    for (let j = 0; j !== stride; ++j) result[dstOffset++] = values[srcOffset + j];
  }

  return result;
}

// function for parsing AOS keyframe formats
export function flattenJSON<T extends object>(
  keys: ({ time: number } & T)[],
  times: number[],
  values: number[],
  property: keyof T,
) {
  let i = 1;
  let key = keys[0];

  while (key !== undefined && key![property] === undefined) key = keys[i++];

  if (key === undefined) return; // no data

  let value = key![property];
  if (value === undefined) return; // no data

  if (Array.isArray(value)) {
    do {
      value = key![property];

      if (value !== undefined) {
        times.push(key!.time);
        values.push.apply(values, value); // push all elements
      }

      key = keys[i++];
    } while (key !== undefined);
    //@ts-expect-error
  } else if (value.toArray !== undefined) {
    // ...assume THREE.Math-ish

    do {
      value = key![property];

      if (value !== undefined) {
        times.push(key.time);
        //@ts-expect-error
        value.toArray(values, values.length);
      }

      key = keys[i++];
    } while (key !== undefined);
  } else {
    // otherwise push as-is

    do {
      value = key![property];

      if (value !== undefined) {
        times.push(key.time);
        values.push(value);
      }

      key = keys[i++];
    } while (key !== undefined);
  }
}

export function subclip(
  sourceClip: AnimationClip,
  name: string,
  startFrame: number,
  endFrame: number,
  fps: number = 30,
) {
  const clip = sourceClip.clone();

  clip.name = name;

  const tracks = [];

  for (let i = 0; i < clip.tracks.length; ++i) {
    const track = clip.tracks[i];
    const valueSize = track.getValueSize();

    const times = [];
    const values = [];

    for (let j = 0; j < track.times.length; ++j) {
      const frame = track.times[j] * fps;

      if (frame < startFrame || frame >= endFrame) continue;

      times.push(track.times[j]);

      for (let k = 0; k < valueSize; ++k) {
        values.push(track.values[j * valueSize + k]);
      }
    }

    if (times.length === 0) continue;

    track.times = convertArray(times, track.times.constructor);
    track.values = convertArray(values, track.values.constructor);

    tracks.push(track);
  }

  clip.tracks = tracks;

  // find minimum .times value across all tracks in the trimmed clip

  let minStartTime = Infinity;

  for (let i = 0; i < clip.tracks.length; ++i) {
    if (minStartTime > clip.tracks[i].times[0]) {
      minStartTime = clip.tracks[i].times[0];
    }
  }

  // shift all tracks such that clip begins at t=0

  for (let i = 0; i < clip.tracks.length; ++i) {
    clip.tracks[i].shift(-1 * minStartTime);
  }

  clip.resetDuration();

  return clip;
}

export function makeClipAdditive(
  targetClip: AnimationClip,
  referenceFrame: number = 0,
  referenceClip: AnimationClip = targetClip,
  fps: number = 30,
) {
  if (fps <= 0) fps = 30;

  const numTracks = referenceClip.tracks.length;
  const referenceTime = referenceFrame / fps;

  // Make each track's values relative to the values at the reference frame
  for (let i = 0; i < numTracks; ++i) {
    const referenceTrack = referenceClip.tracks[i];
    const referenceTrackType = referenceTrack.ValueTypeName;

    // Skip this track if it's non-numeric
    if (referenceTrackType === 'bool' || referenceTrackType === 'string') continue;

    // Find the track in the target clip whose name and type matches the reference track
    const targetTrack = targetClip.tracks.find(
      track => track.name === referenceTrack.name && track.ValueTypeName === referenceTrackType,
    );

    if (targetTrack === undefined) continue;

    let referenceOffset = 0;
    const referenceValueSize = referenceTrack.getValueSize();

    //@ts-expect-error
    if (referenceTrack.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline) {
      referenceOffset = referenceValueSize / 3;
    }

    let targetOffset = 0;
    const targetValueSize = targetTrack.getValueSize();

    //@ts-expect-error
    if (targetTrack.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline) {
      targetOffset = targetValueSize / 3;
    }

    const lastIndex = referenceTrack.times.length - 1;
    let referenceValue;

    // Find the value to subtract out of the track
    if (referenceTime <= referenceTrack.times[0]) {
      // Reference frame is earlier than the first keyframe, so just use the first keyframe
      const startIndex = referenceOffset;
      const endIndex = referenceValueSize - referenceOffset;
      referenceValue = arraySlice(referenceTrack.values, startIndex, endIndex);
    } else if (referenceTime >= referenceTrack.times[lastIndex]) {
      // Reference frame is after the last keyframe, so just use the last keyframe
      const startIndex = lastIndex * referenceValueSize + referenceOffset;
      const endIndex = startIndex + referenceValueSize - referenceOffset;
      referenceValue = arraySlice(referenceTrack.values, startIndex, endIndex);
    } else {
      // Interpolate to the reference value
      //@ts-expect-error
      const interpolant = referenceTrack.createInterpolant();
      const startIndex = referenceOffset;
      const endIndex = referenceValueSize - referenceOffset;
      interpolant.evaluate(referenceTime);
      referenceValue = arraySlice(interpolant.resultBuffer, startIndex, endIndex);
    }

    // Conjugate the quaternion
    if (referenceTrackType === 'quaternion') {
      const referenceQuat = new Quaternion().fromArray(referenceValue).normalize().conjugate();
      referenceQuat.toArray(referenceValue);
    }

    // Subtract the reference value from all the track values

    const numTimes = targetTrack.times.length;
    for (let j = 0; j < numTimes; ++j) {
      const valueStart = j * targetValueSize + targetOffset;

      if (referenceTrackType === 'quaternion') {
        // Multiply the conjugate for quaternion track types
        Quaternion.multiplyQuaternionsFlat(
          //@ts-expect-error
          targetTrack.values,
          valueStart,
          referenceValue,
          0,
          targetTrack.values,
          valueStart,
        );
      } else {
        const valueEnd = targetValueSize - targetOffset * 2;

        // Subtract each value for all other numeric track types
        for (let k = 0; k < valueEnd; ++k) {
          targetTrack.values[valueStart + k] -= referenceValue[k];
        }
      }
    }
  }

  targetClip.blendMode = AdditiveAnimationBlendMode;

  return targetClip;
}

export const AnimationUtils = {
  arraySlice,
  convertArray,
  isTypedArray,
  getKeyframeOrder,
  sortedArray,
  flattenJSON,
  subclip,
  makeClipAdditive,
};
