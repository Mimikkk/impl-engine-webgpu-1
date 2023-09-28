import {
  AnimationClip,
  BooleanKeyframeTrack,
  Color,
  ColorKeyframeTrack,
  NumberKeyframeTrack,
  Vector3,
  VectorKeyframeTrack,
} from '../Three.js';

export namespace AnimationClipCreator {
  export const CreateRotationAnimation = (period: number, axis: 'x' | 'y' | 'z'): AnimationClip => {
    const times = [0, period],
      values = [0, 360];

    const trackName = `.rotation[${axis}]`;

    const track = new NumberKeyframeTrack(trackName, times, values);

    return new AnimationClip(trackName, period, [track]);
  };

  export const CreateScaleAxisAnimation = (period: number, axis: 'x' | 'y' | 'z'): AnimationClip => {
    const times = [0, period],
      values = [0, 1];

    const trackName = `.scale[${axis}]`;

    const track = new NumberKeyframeTrack(trackName, times, values);

    return new AnimationClip(trackName, period, [track]);
  };

  export const CreateShakeAnimation = (duration: number, shakeScale: Vector3): AnimationClip => {
    const times: number[] = [],
      values: number[] = [],
      tmp = new Vector3();

    for (let i = 0; i < duration * 10; i++) {
      times.push(i / 10);

      tmp
        .set(Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0)
        .multiply(shakeScale)
        .toArray(values, values.length);
    }

    const trackName = '.position';

    const track = new VectorKeyframeTrack(trackName, times, values);

    return new AnimationClip(trackName, duration, [track]);
  };

  export const CreatePulsationAnimation = (duration: number, pulseScale: number): AnimationClip => {
    const times: number[] = [],
      values: number[] = [],
      tmp = new Vector3();

    for (let i = 0; i < duration * 10; i++) {
      times.push(i / 10);

      const scaleFactor = Math.random() * pulseScale;
      tmp.set(scaleFactor, scaleFactor, scaleFactor).toArray(values, values.length);
    }

    const trackName = '.scale';

    const track = new VectorKeyframeTrack(trackName, times, values);

    return new AnimationClip(trackName, duration, [track]);
  };

  export const CreateVisibilityAnimation = (duration: number): AnimationClip => {
    const times = [0, duration / 2, duration],
      values = [true, false, true];

    const trackName = '.visible';

    const track = new BooleanKeyframeTrack(trackName, times, values as unknown as number[]);

    return new AnimationClip(trackName, duration, [track]);
  };

  export const CreateMaterialColorAnimation = (duration: number, colors: Color[]): AnimationClip => {
    const times = [],
      values = [],
      timeStep = duration / colors.length;

    for (let i = 0; i < colors.length; i++) {
      times.push(i * timeStep);

      const color = colors[i];
      values.push(color.r, color.g, color.b);
    }

    const trackName = '.material.color';

    const track = new ColorKeyframeTrack(trackName, times, values);

    return new AnimationClip(trackName, duration, [track]);
  };
}
