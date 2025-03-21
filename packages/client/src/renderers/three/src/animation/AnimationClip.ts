import * as AnimationUtils from './AnimationUtils.js';
import { KeyframeTrack } from './tracks/KeyframeTrack.js';
import { BooleanKeyframeTrack } from './tracks/BooleanKeyframeTrack.js';
import { ColorKeyframeTrack } from './tracks/ColorKeyframeTrack.js';
import { NumberKeyframeTrack } from './tracks/NumberKeyframeTrack.js';
import { QuaternionKeyframeTrack } from './tracks/QuaternionKeyframeTrack.js';
import { StringKeyframeTrack } from './tracks/StringKeyframeTrack.js';
import { VectorKeyframeTrack } from './tracks/VectorKeyframeTrack.js';
import { MathUtils } from '../math/MathUtils.js';
import { AnimationBlendMode, NormalAnimationBlendMode } from '../constants.js';
import { Bone } from '../objects/Bone.js';
import { Parseable } from '../types.js';
import { Object3D } from '../core/Object3D.js';
import { Vector3 } from '../math/Vector3.js';

export interface MorphTarget {
  name: string;
  vertices: Vector3[];
}

export class AnimationClip {
  declare ['constructor']: new (
    name?: string,
    duration?: number,
    tracks?: KeyframeTrack[],
    blendMode?: AnimationBlendMode,
  ) => this;
  name: string;
  tracks: KeyframeTrack[];
  blendMode: AnimationBlendMode;
  duration: number;
  uuid: string;

  constructor(
    name: string,
    duration: number = -1,
    tracks: KeyframeTrack[] = [],
    blendMode: AnimationBlendMode = NormalAnimationBlendMode,
  ) {
    this.name = name;
    this.tracks = tracks;
    this.duration = duration;
    this.blendMode = blendMode;

    this.uuid = MathUtils.generateUUID();
    if (this.duration < 0) this.resetDuration();
  }

  static parse(json: any): AnimationClip {
    const tracks = [],
      jsonTracks = json.tracks,
      frameTime = 1.0 / (json.fps || 1.0);

    for (let i = 0, n = jsonTracks.length; i !== n; ++i) {
      tracks.push(parseKeyframeTrack(jsonTracks[i]).scale(frameTime));
    }

    const clip = new this(json.name, json.duration, tracks, json.blendMode);
    clip.uuid = json.uuid;

    return clip;
  }

  static CreateFromMorphTargetSequence(
    name: string,
    morphTargetSequence: MorphTarget[],
    fps: number,
    noLoop: boolean,
  ): AnimationClip | null {
    const numMorphTargets = morphTargetSequence.length;
    const tracks = [];

    for (let i = 0; i < numMorphTargets; i++) {
      let times: number[] = [];
      let values: number[] = [];

      times.push((i + numMorphTargets - 1) % numMorphTargets, i, (i + 1) % numMorphTargets);

      values.push(0, 1, 0);

      const order = AnimationUtils.getKeyframeOrder(times);
      times = AnimationUtils.sortedArray(times, 1, order) as number[];
      values = AnimationUtils.sortedArray(values, 1, order) as number[];

      // if there is a key at the first frame, duplicate it as the
      // last frame as well for perfect loop.
      if (!noLoop && times[0] === 0) {
        times.push(numMorphTargets);
        values.push(values[0]);
      }

      tracks.push(
        new NumberKeyframeTrack('.morphTargetInfluences[' + morphTargetSequence[i].name + ']', times, values).scale(
          1.0 / fps,
        ),
      );
    }

    return new this(name, -1, tracks);
  }

  static findByName(objectOrClipArray: Object3D | AnimationClip[], name: string): AnimationClip | null {
    let clipArray = objectOrClipArray as AnimationClip[];

    if (!Array.isArray(objectOrClipArray)) {
      const o = objectOrClipArray;
      clipArray = (o.geometry && o.geometry.animations) || o.animations;
    }

    for (let i = 0; i < clipArray.length; i++) {
      if (clipArray[i].name === name) {
        return clipArray[i];
      }
    }

    return null;
  }

  static CreateClipsFromMorphTargetSequences(
    morphTargets: MorphTarget[],
    fps: number,
    noLoop: boolean,
  ): AnimationClip[] {
    const animationToMorphTargets: Record<string, MorphTarget[]> = {};

    // tested with https://regex101.com/ on trick sequences
    // such flamingo_flyA_003, flamingo_run1_003, crdeath0059
    const pattern = /^([\w-]*?)([\d]+)$/;

    // sort morph target names into animation groups based
    // patterns like Walk_001, Walk_002, Run_001, Run_002
    for (let i = 0, il = morphTargets.length; i < il; i++) {
      const morphTarget = morphTargets[i];
      const parts = morphTarget.name.match(pattern);

      if (parts && parts.length > 1) {
        const name = parts[1];

        let animationMorphTargets = animationToMorphTargets[name];

        if (!animationMorphTargets) {
          animationToMorphTargets[name] = animationMorphTargets = [];
        }

        animationMorphTargets.push(morphTarget);
      }
    }

    const clips: AnimationClip[] = [];

    for (const name in animationToMorphTargets) {
      clips.push(this.CreateFromMorphTargetSequence(name, animationToMorphTargets[name], fps, noLoop)!);
    }

    return clips;
  }

  // parse the animation.hierarchy format
  static parseAnimation(animation: any, bones: Bone[]): AnimationClip | null {
    const addNonemptyTrack = function (
      trackType: any,
      trackName: string,
      animationKeys: any,
      propertyName: string,
      destTracks: any,
    ) {
      // only return track if there are actually keys.
      if (animationKeys.length !== 0) {
        const times: number[] = [];
        const values: number[] = [];

        AnimationUtils.flattenJSON(animationKeys, times, values, propertyName);

        // empty keys are filtered out, so check again
        if (times.length !== 0) {
          destTracks.push(new trackType(trackName, times, values));
        }
      }
    };

    const tracks = [];

    const clipName = animation.name || 'default';
    const fps = animation.fps || 30;
    const blendMode = animation.blendMode;

    // automatic length determination in AnimationClip.
    let duration = animation.length || -1;

    const hierarchyTracks = animation.hierarchy || [];

    for (let h = 0; h < hierarchyTracks.length; h++) {
      const animationKeys = hierarchyTracks[h].keys;

      // skip empty tracks
      if (!animationKeys || animationKeys.length === 0) continue;

      // process morph targets
      if (animationKeys[0].morphTargets) {
        // figure out all morph targets used in this track
        const morphTargetNames = {};

        let k;

        for (k = 0; k < animationKeys.length; k++) {
          if (animationKeys[k].morphTargets) {
            for (let m = 0; m < animationKeys[k].morphTargets.length; m++) {
              //@ts-expect-error
              morphTargetNames[animationKeys[k].morphTargets[m]] = -1;
            }
          }
        }

        // create a track for each morph target with all zero
        // morphTargetInfluences except for the keys in which
        // the morphTarget is named.
        for (const morphTargetName in morphTargetNames) {
          const times = [];
          const values = [];

          for (let m = 0; m !== animationKeys[k].morphTargets.length; ++m) {
            const animationKey = animationKeys[k];

            times.push(animationKey.time);
            values.push(animationKey.morphTarget === morphTargetName ? 1 : 0);
          }

          tracks.push(new NumberKeyframeTrack('.morphTargetInfluence[' + morphTargetName + ']', times, values));
        }

        //@ts-expect-error
        duration = morphTargetNames.length * fps;
      } else {
        // ...assume skeletal animation

        const boneName = '.bones[' + bones[h].name + ']';
        addNonemptyTrack(VectorKeyframeTrack, boneName + '.position', animationKeys, 'pos', tracks);
        addNonemptyTrack(QuaternionKeyframeTrack, boneName + '.quaternion', animationKeys, 'rot', tracks);
        addNonemptyTrack(VectorKeyframeTrack, boneName + '.scale', animationKeys, 'scl', tracks);
      }
    }

    if (tracks.length === 0) {
      return null;
    }

    return new this(clipName, duration, tracks, blendMode);
  }

  resetDuration(): AnimationClip {
    const tracks = this.tracks;
    let duration = 0;

    for (let i = 0, n = tracks.length; i !== n; ++i) {
      const track = this.tracks[i];

      duration = Math.max(duration, track.times[track.times.length - 1]);
    }

    this.duration = duration;

    return this;
  }

  trim(): AnimationClip {
    for (let i = 0; i < this.tracks.length; i++) {
      this.tracks[i].trim(0, this.duration);
    }

    return this;
  }

  validate(): boolean {
    let valid = true;

    for (let i = 0; i < this.tracks.length; i++) {
      valid = valid && this.tracks[i].validate();
    }

    return valid;
  }

  optimize(): AnimationClip {
    for (let i = 0; i < this.tracks.length; i++) {
      this.tracks[i].optimize();
    }

    return this;
  }

  clone(): AnimationClip {
    const tracks = [];

    for (let i = 0; i < this.tracks.length; i++) {
      tracks.push(this.tracks[i].clone());
    }

    return new this.constructor(this.name, this.duration, tracks, this.blendMode);
  }
}

type TrackType =
  | 'scalar'
  | 'double'
  | 'float'
  | 'number'
  | 'integer'
  | 'vector'
  | 'vector2'
  | 'vector3'
  | 'vector4'
  | 'color'
  | 'quaternion'
  | 'bool'
  | 'boolean'
  | 'string';
function getTrackTypeForValueTypeName(type: TrackType) {
  switch (type) {
    case 'scalar':
    case 'double':
    case 'float':
    case 'number':
    case 'integer':
      return NumberKeyframeTrack;
    case 'vector':
    case 'vector2':
    case 'vector3':
    case 'vector4':
      return VectorKeyframeTrack;
    case 'color':
      return ColorKeyframeTrack;
    case 'quaternion':
      return QuaternionKeyframeTrack;
    case 'bool':
    case 'boolean':
      return BooleanKeyframeTrack;
    case 'string':
      return StringKeyframeTrack;
  }
}

function parseKeyframeTrack(json: any): KeyframeTrack {
  if (json.type === undefined) throw new Error('THREE.KeyframeTrack: track type undefined, can not parse');

  const trackType = getTrackTypeForValueTypeName(json.type);

  if (json.times === undefined) {
    const times: number[] = [];
    const values: number[] = [];

    AnimationUtils.flattenJSON(json.keys, times, values, 'value');

    json.times = times;
    json.values = values;
  }

  if (Parseable.is(trackType)) return trackType.parse() as unknown as KeyframeTrack;
  return new trackType(json.name, json.times, json.values, json.interpolation);
}
