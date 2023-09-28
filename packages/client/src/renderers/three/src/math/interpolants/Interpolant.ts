import { NumberArray } from '../../types.js';

export interface Interpolant {
  index: number;
  positions: NumberArray;
  result: NumberArray;
  samples: NumberArray;
  stride: number;
  __cacheIndex?: number;

  evaluate: (timestamp: number) => NumberArray;
  sampleAt: (index: number) => NumberArray;
  interpolate: (i1: number, t0: number, t: number, t1: number) => NumberArray;
  validate?: (i1: number, t0: number, t1: number) => void;
}

export const sampler = (interpolant: Interpolant, at: number): NumberArray => {
  const offset = at * interpolant.stride;
  for (let i = 0; i !== interpolant.stride; ++i) interpolant.result[i] = interpolant.samples[offset + i];
  return interpolant.result;
};
export const evaluator = (interpolant: Interpolant, timestamp: number): NumberArray => {
  let index = interpolant.index;
  let next = interpolant.positions[index];
  let previous = interpolant.positions[index - 1];

  validate: {
    seek: {
      let right: number;

      linear_scan: {
        forward_scan: if (!(timestamp < next)) {
          for (let giveUpAt = index + 2; ; ) {
            if (next === undefined) {
              if (timestamp < previous) break forward_scan;

              index = interpolant.positions.length;
              interpolant.index = index;
              return interpolant.sampleAt(index - 1);
            }

            if (index === giveUpAt) break; // options loop

            previous = next;
            next = interpolant.positions[++index];

            if (timestamp < next) break seek;
          }

          right = interpolant.positions.length;
          break linear_scan;
        }

        if (!(timestamp >= previous)) {
          const t1global = interpolant.positions[1];

          if (timestamp < t1global) {
            index = 2; // + 1, using the scan for the details
            previous = t1global;
          }

          for (let giveUpAt = index - 2; ; ) {
            if (previous === undefined) {
              interpolant.index = 0;
              return interpolant.sampleAt(0);
            }

            if (index === giveUpAt) break;

            next = previous;
            previous = interpolant.positions[--index - 1];

            if (timestamp >= previous) break seek;
          }

          right = index;
          index = 0;
          break linear_scan;
        }

        break validate;
      }

      while (index < right) {
        const mid = (index + right) >>> 1;
        if (timestamp < interpolant.positions[mid]) right = mid;
        else index = mid + 1;
      }

      next = interpolant.positions[index];
      previous = interpolant.positions[index - 1];

      if (previous === undefined) {
        interpolant.index = 0;
        return interpolant.sampleAt(0);
      }
      if (next === undefined) {
        index = interpolant.positions.length;
        interpolant.index = index;
        return interpolant.sampleAt(index - 1);
      }
    }

    interpolant.index = index;
    interpolant.validate?.(index, previous, next);
  }

  return interpolant.interpolate(index, previous, timestamp, next);
};

export namespace Interpolant {
  export interface Parameters {
    positions: NumberArray;
    samples: NumberArray;
    stride: number;
    result?: NumberArray;
    index?: number;
  }

  export interface Options extends Parameters {
    interpolate(interpolant: Interpolant, at: number, previous: number, current: number, next: number): NumberArray;

    validate?(interpolant: Interpolant, at: number, current: number, next: number): void;

    sampleAt?(interpolant: Interpolant, index: number): NumberArray;
  }

  export const create = ({
    samples,
    sampleAt = sampler,
    stride,
    interpolate,
    positions,
    validate,
    //@ts-expect-error
    result = new samples.constructor(stride),
    index = 0,
  }: Options): Interpolant => {
    const self: Interpolant = {
      positions,
      samples,
      result,
      stride,
      index,
      interpolate: (i1, t0, t, t1) => interpolate(self, i1, t0, t, t1),
      validate: validate ? (i1, t0, t1) => validate(self, i1, t0, t1) : undefined,
      sampleAt: at => sampleAt!(self, at),
      evaluate: timestamp => evaluator(self, timestamp),
    };
    return self;
  };
}
