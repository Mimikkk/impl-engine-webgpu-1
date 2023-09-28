import {
  AdditiveAnimationBlendMode,
  AnimationActionLoopStyle,
  AnimationBlendMode,
  LoopOnce,
  LoopPingPong,
  LoopRepeat,
  NormalAnimationBlendMode,
  WrapAroundEnding,
  ZeroCurvatureEnding,
  ZeroSlopeEnding,
} from '../constants.js';
import { AnimationMixer } from './AnimationMixer.js';
import { AnimationClip } from './AnimationClip.js';
import { Object3D } from '../core/Object3D.js';
import { Interpolant } from '../math/interpolants/Interpolant.js';

export class AnimationAction {
  blendMode: AnimationBlendMode;
  loop: AnimationActionLoopStyle;
  time: number;
  timeScale: number;
  weight: number;
  repetitions: number;
  paused: boolean;
  enabled: boolean;
  clampWhenFinished: boolean;
  zeroSlopeAtStart: boolean;
  zeroSlopeAtEnd: boolean;
  _mixer: AnimationMixer;
  _clip: AnimationClip;
  _localRoot: Object3D | null;
  _interpolantSettings: { endingStart: number; endingEnd: number };
  _interpolants: any[];
  _propertyBindings: any[];
  _cacheIndex: number | null;
  _byClipCacheIndex: number | null;
  _startTime: number | null;
  _effectiveTimeScale: number;
  _weightInterpolant: Interpolant | null;
  _loopCount: number;
  _timeScaleInterpolant: Interpolant | null;
  _effectiveWeight: number;

  constructor(
    mixer: AnimationMixer,
    clip: AnimationClip,
    localRoot: Object3D | null = null,
    blendMode: AnimationBlendMode = clip.blendMode,
  ) {
    this._mixer = mixer;
    this._clip = clip;
    this._localRoot = localRoot;
    this.blendMode = blendMode;

    const tracks = clip.tracks;
    const nTracks = tracks.length;
    const interpolants = new Array(nTracks);

    const interpolantSettings = {
      endingStart: ZeroCurvatureEnding,
      endingEnd: ZeroCurvatureEnding,
    };

    for (let i = 0; i !== nTracks; ++i) {
      interpolants[i] = tracks[i].createInterpolant();
    }

    this._interpolantSettings = interpolantSettings;
    this._interpolants = interpolants;
    this._propertyBindings = new Array(nTracks);
    this._cacheIndex = null;
    this._byClipCacheIndex = null;
    this._timeScaleInterpolant = null;
    this._weightInterpolant = null;
    this.loop = LoopRepeat;
    this._loopCount = -1;
    this._startTime = null;
    this.time = 0;
    this.timeScale = 1;
    this._effectiveTimeScale = 1;
    this.weight = 1;
    this._effectiveWeight = 1;
    this.repetitions = Infinity;
    this.paused = false;
    this.enabled = true;
    this.clampWhenFinished = false;
    this.zeroSlopeAtStart = true;
    this.zeroSlopeAtEnd = true;
  }

  play(): AnimationAction {
    this._mixer._activateAction(this);

    return this;
  }
  stop(): AnimationAction {
    this._mixer._deactivateAction(this);

    return this.reset();
  }
  reset(): AnimationAction {
    this.paused = false;
    this.enabled = true;

    this.time = 0; // restart clip
    this._loopCount = -1; // forget previous loops
    this._startTime = null; // forget scheduling

    return this.stopFading().stopWarping();
  }
  isRunning(): boolean {
    return (
      this.enabled &&
      !this.paused &&
      this.timeScale !== 0 &&
      this._startTime === null &&
      this._mixer._isActiveAction(this)
    );
  }
  isScheduled(): boolean {
    return this._mixer._isActiveAction(this);
  }
  startAt(time: number): AnimationAction {
    this._startTime = time;

    return this;
  }
  setLoop(mode: AnimationActionLoopStyle, repetitions: number) {
    this.loop = mode;
    this.repetitions = repetitions;

    return this;
  }
  setEffectiveWeight(weight: number) {
    this.weight = weight;

    // note: same logic as when updated at runtime
    this._effectiveWeight = this.enabled ? weight : 0;

    return this.stopFading();
  }
  getEffectiveWeight(): number {
    return this._effectiveWeight;
  }
  fadeIn(duration: number): AnimationAction {
    return this._scheduleFading(duration, 0, 1);
  }
  fadeOut(duration: number): AnimationAction {
    return this._scheduleFading(duration, 1, 0);
  }
  crossFadeFrom(fadeOutAction: AnimationAction, duration: number, warp: boolean): AnimationAction {
    fadeOutAction.fadeOut(duration);
    this.fadeIn(duration);

    if (warp) {
      const fadeInDuration = this._clip.duration,
        fadeOutDuration = fadeOutAction._clip.duration,
        startEndRatio = fadeOutDuration / fadeInDuration,
        endStartRatio = fadeInDuration / fadeOutDuration;

      fadeOutAction.warp(1.0, startEndRatio, duration);
      this.warp(endStartRatio, 1.0, duration);
    }

    return this;
  }
  crossFadeTo(fadeInAction: AnimationAction, duration: number, warp: boolean): AnimationAction {
    return fadeInAction.crossFadeFrom(this, duration, warp);
  }
  stopFading(): AnimationAction {
    const weightInterpolant = this._weightInterpolant;

    if (weightInterpolant !== null) {
      this._weightInterpolant = null;
      this._mixer._takeBackControlInterpolant(weightInterpolant);
    }

    return this;
  }
  setEffectiveTimeScale(timeScale: number): AnimationAction {
    this.timeScale = timeScale;
    this._effectiveTimeScale = this.paused ? 0 : timeScale;

    return this.stopWarping();
  }
  getEffectiveTimeScale(): number {
    return this._effectiveTimeScale;
  }
  setDuration(duration: number): AnimationAction {
    this.timeScale = this._clip.duration / duration;

    return this.stopWarping();
  }
  syncWith(action: AnimationAction): AnimationAction {
    this.time = action.time;
    this.timeScale = action.timeScale;

    return this.stopWarping();
  }
  halt(duration: number): AnimationAction {
    return this.warp(this._effectiveTimeScale, 0, duration);
  }
  warp(startTimeScale: number, endTimeScale: number, duration: number): AnimationAction {
    const mixer = this._mixer,
      now = mixer.time,
      timeScale = this.timeScale;

    let interpolant = this._timeScaleInterpolant;

    if (interpolant === null) {
      interpolant = mixer._lendControlInterpolant();
      this._timeScaleInterpolant = interpolant;
    }

    const times = interpolant!.positions,
      values = interpolant!.samples;

    times[0] = now;
    times[1] = now + duration;

    values[0] = startTimeScale / timeScale;
    values[1] = endTimeScale / timeScale;

    return this;
  }
  stopWarping(): AnimationAction {
    const timeScaleInterpolant = this._timeScaleInterpolant;

    if (timeScaleInterpolant !== null) {
      this._timeScaleInterpolant = null;
      this._mixer._takeBackControlInterpolant(timeScaleInterpolant);
    }

    return this;
  }
  getMixer(): AnimationMixer {
    return this._mixer;
  }
  getClip(): AnimationClip {
    return this._clip;
  }
  getRoot(): Object3D {
    return this._localRoot! || this._mixer._root;
  }
  _update(time: number, deltaTime: number, timeDirection: number, accuIndex: number): void {
    // called by the mixer

    if (!this.enabled) {
      // call ._updateWeight() to update ._effectiveWeight

      this._updateWeight(time);
      return;
    }

    const startTime = this._startTime;

    if (startTime !== null) {
      // check for scheduled start of action

      const timeRunning = (time - startTime) * timeDirection;
      if (timeRunning < 0 || timeDirection === 0) {
        deltaTime = 0;
      } else {
        this._startTime = null; // unschedule
        deltaTime = timeDirection * timeRunning;
      }
    }

    // apply time scale and advance time

    deltaTime *= this._updateTimeScale(time);
    const clipTime = this._updateTime(deltaTime);

    // note: _updateTime may disable the action resulting in
    // an effective weight of 0

    const weight = this._updateWeight(time);

    if (weight > 0) {
      const interpolants = this._interpolants;
      const propertyMixers = this._propertyBindings;

      switch (this.blendMode) {
        case AdditiveAnimationBlendMode:
          for (let j = 0, m = interpolants.length; j !== m; ++j) {
            interpolants[j].evaluate(clipTime);
            propertyMixers[j].accumulateAdditive(weight);
          }

          break;

        case NormalAnimationBlendMode:
        default:
          for (let j = 0, m = interpolants.length; j !== m; ++j) {
            interpolants[j].evaluate(clipTime);
            propertyMixers[j].accumulate(accuIndex, weight);
          }
      }
    }
  }
  _updateWeight(time: number): number {
    let weight = 0;

    if (this.enabled) {
      weight = this.weight;
      const interpolant = this._weightInterpolant;

      if (interpolant !== null) {
        const interpolantValue = interpolant.evaluate(time)[0];

        weight *= interpolantValue;

        if (time > interpolant.positions[1]) {
          this.stopFading();

          if (interpolantValue === 0) {
            // faded out, disable
            this.enabled = false;
          }
        }
      }
    }

    this._effectiveWeight = weight;
    return weight;
  }
  _updateTimeScale(time: number): number {
    let timeScale = 0;

    if (!this.paused) {
      timeScale = this.timeScale;

      const interpolant = this._timeScaleInterpolant;

      if (interpolant !== null) {
        const interpolantValue = interpolant.evaluate(time)[0];

        timeScale *= interpolantValue;

        if (time > interpolant.positions[1]) {
          this.stopWarping();

          if (timeScale === 0) {
            // motion has halted, pause
            this.paused = true;
          } else {
            // warp done - apply final time scale
            this.timeScale = timeScale;
          }
        }
      }
    }

    this._effectiveTimeScale = timeScale;
    return timeScale;
  }
  _updateTime(deltaTime: number): number {
    const duration = this._clip.duration;
    const loop = this.loop;

    let time = this.time + deltaTime;
    let loopCount = this._loopCount;

    const pingPong = loop === LoopPingPong;

    if (deltaTime === 0) {
      if (loopCount === -1) return time;

      return pingPong && (loopCount & 1) === 1 ? duration - time : time;
    }

    if (loop === LoopOnce) {
      if (loopCount === -1) {
        // just started

        this._loopCount = 0;
        this._setEndings(true, true, false);
      }

      handle_stop: {
        if (time >= duration) {
          time = duration;
        } else if (time < 0) {
          time = 0;
        } else {
          this.time = time;

          break handle_stop;
        }

        if (this.clampWhenFinished) this.paused = true;
        else this.enabled = false;

        this.time = time;

        this._mixer.dispatchEvent<AnimationMixer.ProgressEvent>({
          type: 'finished',
          action: this,
          direction: deltaTime < 0 ? -1 : 1,
        });
      }
    } else {
      // repetitive Repeat or PingPong

      if (loopCount === -1) {
        // just started

        if (deltaTime >= 0) {
          loopCount = 0;

          this._setEndings(true, this.repetitions === 0, pingPong);
        } else {
          // when looping in reverse direction, the initial
          // transition through zero counts as a repetition,
          // so leave loopCount at -1

          this._setEndings(this.repetitions === 0, true, pingPong);
        }
      }

      if (time >= duration || time < 0) {
        // wrap around

        const loopDelta = Math.floor(time / duration); // signed
        time -= duration * loopDelta;

        loopCount += Math.abs(loopDelta);

        const pending = this.repetitions - loopCount;

        if (pending <= 0) {
          // have to stop (switch state, clamp time, fire event)

          if (this.clampWhenFinished) this.paused = true;
          else this.enabled = false;

          time = deltaTime > 0 ? duration : 0;

          this.time = time;

          this._mixer.dispatchEvent<AnimationMixer.ProgressEvent>({
            type: 'finished',
            action: this,
            direction: deltaTime > 0 ? 1 : -1,
          });
        } else {
          // keep running

          if (pending === 1) {
            // entering the last round

            const atStart = deltaTime < 0;
            this._setEndings(atStart, !atStart, pingPong);
          } else {
            this._setEndings(false, false, pingPong);
          }

          this._loopCount = loopCount;

          this.time = time;

          this._mixer.dispatchEvent<AnimationMixer.LoopEvent>({
            type: 'loop',
            action: this,
            loopDelta: loopDelta,
          });
        }
      } else {
        this.time = time;
      }

      if (pingPong && (loopCount & 1) === 1) {
        // invert time for the "pong round"

        return duration - time;
      }
    }

    return time;
  }
  _setEndings(atStart: boolean, atEnd: boolean, pingPong: boolean) {
    const settings = this._interpolantSettings;

    if (pingPong) {
      settings.endingStart = ZeroSlopeEnding;
      settings.endingEnd = ZeroSlopeEnding;
    } else {
      if (atStart) {
        settings.endingStart = this.zeroSlopeAtStart ? ZeroSlopeEnding : ZeroCurvatureEnding;
      } else {
        settings.endingStart = WrapAroundEnding;
      }

      if (atEnd) {
        settings.endingEnd = this.zeroSlopeAtEnd ? ZeroSlopeEnding : ZeroCurvatureEnding;
      } else {
        settings.endingEnd = WrapAroundEnding;
      }
    }
  }
  _scheduleFading(duration: number, weightNow: number, weightThen: number): AnimationAction {
    const mixer = this._mixer;
    const now = mixer.time;
    let interpolant = this._weightInterpolant!;

    if (interpolant === null) {
      interpolant = mixer._lendControlInterpolant();
      this._weightInterpolant = interpolant;
    }

    const times = interpolant.positions,
      values = interpolant.samples;

    times[0] = now;
    values[0] = weightNow;
    times[1] = now + duration;
    values[1] = weightThen;

    return this;
  }
}
