import * as AnimationUtils from './AnimationUtils.js';
import { KeyframeTrack } from './tracks/KeyframeTrack.js';
import { BooleanKeyframeTrack } from './tracks/BooleanKeyframeTrack.js';
import { ColorKeyframeTrack } from './tracks/ColorKeyframeTrack.js';
import { NumberKeyframeTrack } from './tracks/NumberKeyframeTrack.js';
import { QuaternionKeyframeTrack } from './tracks/QuaternionKeyframeTrack.js';
import { StringKeyframeTrack } from './tracks/StringKeyframeTrack.js';
import { VectorKeyframeTrack } from './tracks/VectorKeyframeTrack.js';
import { MathUtils } from '../MathUtils.js';
import { NormalAnimationBlendMode } from '../../common/Constants.js';
import { Bone } from '../objects/Bone.js';
import { Object3D } from '../Object3D.js';
import { NumberArray } from '../types.js';
import { Constructable } from 'vitest';

export class AnimationClip {
  declare ['constructor']: typeof AnimationClip;
  name: any;
  duration: number;
  blendMode: number;
  tracks: KeyframeTrack[];
  uuid: string;

  constructor(
    name: string,
    duration: number = -1,
    tracks: KeyframeTrack[],
    blendMode: number = NormalAnimationBlendMode,
  ) {
    this.name = name;
    this.tracks = tracks;
    this.duration = duration;
    this.blendMode = blendMode;

    this.uuid = MathUtils.generateUUID();

    // this means it should figure out its duration by scanning the tracks
    if (this.duration < 0) {
      this.resetDuration();
    }
  }

  static parse(json: {
    name: string;
    duration: number;
    tracks: ReturnType<typeof KeyframeTrack.toJSON>[];
    blendMode: number;
    fps: number;
    uuid: string;
  }) {
    const tracks = [];
    const jsonTracks = json.tracks;
    const frameTime = 1.0 / (json.fps || 1.0);

    for (let i = 0, n = jsonTracks.length; i !== n; ++i) {
      tracks.push(parseKeyframeTrack(jsonTracks[i]).scale(frameTime));
    }

    const clip = new this(json.name, json.duration, tracks, json.blendMode);
    clip.uuid = json.uuid;

    return clip;
  }

  static toJSON(clip: AnimationClip): {
    name: string;
    duration: number;
    tracks: any[];
    uuid: string;
    blendMode: number;
  } {
    const tracks: ReturnType<typeof KeyframeTrack.toJSON>[] = [],
      clipTracks = clip.tracks;

    const json = {
      name: clip.name,
      duration: clip.duration,
      tracks: tracks,
      uuid: clip.uuid,
      blendMode: clip.blendMode,
    };

    for (let i = 0, n = clipTracks.length; i !== n; ++i) tracks.push(KeyframeTrack.toJSON(clipTracks[i]));

    return json;
  }

  static CreateFromMorphTargetSequence(
    name: string,
    morphTargetSequence: { name: string }[],
    fps: number,
    noLoop?: boolean,
  ) {
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
    let clipArray: AnimationClip[];

    if (!Array.isArray(objectOrClipArray)) {
      const o = objectOrClipArray;
      clipArray = (o.geometry && o.geometry.animations) || o.animations;
    } else {
      clipArray = objectOrClipArray;
    }

    for (let i = 0; i < clipArray.length; i++) {
      if (clipArray[i].name === name) {
        return clipArray[i];
      }
    }

    return null;
  }

  static CreateClipsFromMorphTargetSequences(morphTargets: Object3D[], fps: number, noLoop?: boolean) {
    const animationToMorphTargets: Record<string, Object3D[]> = {};

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

    const clips = [];

    for (const name in animationToMorphTargets) {
      clips.push(this.CreateFromMorphTargetSequence(name, animationToMorphTargets[name], fps, noLoop));
    }

    return clips;
  }

  // parse the animation.hierarchy format
  static parseAnimation(animation: any, bones: Bone[]) {
    if (!animation) {
      console.error('THREE.AnimationClip: No animation in JSONLoader data.');
      return null;
    }

    const addNonemptyTrack = (
      trackType: Constructable,
      trackName: string,
      animationKeys: KeyframeTrack[],
      propertyName: string,
      destTracks: KeyframeTrack[],
    ) => {
      // only return track if there are actually keys.
      if (animationKeys.length !== 0) {
        const times: NumberArray = [];
        const values: NumberArray = [];

        //@ts-expect-error
        AnimationUtils.flattenJSON(animationKeys, times, values, propertyName);

        // empty keys are filtered out, so check again
        if (times.length !== 0) {
          destTracks.push(new trackType(trackName, times, values));
        }
      }
    };

    const tracks = [];

    const clipName: string = animation.name || 'default';
    const fps: number = animation.fps || 30;
    const blendMode: number = animation.blendMode;

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
        const morphTargetNames: Record<string, string> = {};

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

        const boneName = `.bones[${bones[h].name}]`;

        addNonemptyTrack(VectorKeyframeTrack, `${boneName}.position`, animationKeys, 'pos', tracks);
        addNonemptyTrack(QuaternionKeyframeTrack, `${boneName}.quaternion`, animationKeys, 'rot', tracks);
        addNonemptyTrack(VectorKeyframeTrack, `${boneName}.scale`, animationKeys, 'scl', tracks);
      }
    }

    if (tracks.length === 0) return null;
    return new this(clipName, duration, tracks, blendMode);
  }

  resetDuration() {
    const tracks = this.tracks;
    let duration = 0;

    for (let i = 0, n = tracks.length; i !== n; ++i) {
      const track = this.tracks[i];

      duration = Math.max(duration, track.times[track.times.length - 1]);
    }

    this.duration = duration;

    return this;
  }

  trim() {
    for (let i = 0; i < this.tracks.length; i++) {
      this.tracks[i].trim(0, this.duration);
    }

    return this;
  }

  validate() {
    let valid = true;

    for (let i = 0; i < this.tracks.length; i++) {
      valid = valid && this.tracks[i].validate();
    }

    return valid;
  }

  optimize() {
    for (let i = 0; i < this.tracks.length; i++) {
      this.tracks[i].optimize();
    }

    return this;
  }

  clone() {
    const tracks = [];

    for (let i = 0; i < this.tracks.length; i++) {
      tracks.push(this.tracks[i].clone());
    }

    return new this.constructor(this.name, this.duration, tracks, this.blendMode);
  }

  toJSON() {
    return this.constructor.toJSON(this);
  }
}

function getTrackTypeForValueTypeName(typeName: string) {
  switch (typeName.toLowerCase()) {
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

  throw new Error('THREE.KeyframeTrack: Unsupported typeName: ' + typeName);
}

function parseKeyframeTrack(json: {
  name: string;
  keys?: any;
  times?: number[];
  values: number[];
  interpolation?: number;
  type: string;
}) {
  const trackType = getTrackTypeForValueTypeName(json.type);

  if (json.times === undefined) {
    const times: number[] = [];
    const values: number[] = [];

    //@ts-expect-error
    AnimationUtils.flattenJSON(json.keys, times, values, 'value');

    json.times = times;
    json.values = values;
  }

  return new trackType(json.name, json.times, json.values, json.interpolation);
}
