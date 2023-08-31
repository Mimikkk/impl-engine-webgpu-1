import { TypedArray } from './types.js';

export abstract class Interpolant<Settings extends {} = {}> {
  parameterPositions: number[];
  _cachedIndex: number;
  resultBuffer: TypedArray;
  valueSize: number;
  sampleValues: TypedArray;
  settings: null | Settings;
  DefaultSettings_: Settings;

  constructor(parameterPositions: number[], sampleValues: TypedArray, sampleSize: number, resultBuffer: TypedArray) {
    this.parameterPositions = parameterPositions;
    this._cachedIndex = 0;

    //@ts-expect-error
    this.resultBuffer = resultBuffer ? resultBuffer : new sampleValues.constructor(sampleSize);
    this.sampleValues = sampleValues;
    this.valueSize = sampleSize;

    this.settings = null;
    this.DefaultSettings_ = {};
  }

  evaluate(t: number) {
    const pp = this.parameterPositions;
    let i1 = this._cachedIndex;
    let t1 = pp[i1];
    let t0 = pp[i1 - 1];

    validate_interval: {
      seek: {
        let right: number;

        linear_scan: {
          forward_scan: if (!(t < t1)) {
            for (let giveUpAt = i1 + 2; ; ) {
              if (t1 === undefined) {
                if (t < t0) break forward_scan;

                i1 = pp.length;
                this._cachedIndex = i1;
                return this.copySampleValue_(i1 - 1);
              }

              if (i1 === giveUpAt) break; // this loop

              t0 = t1;
              t1 = pp[++i1];

              if (t < t1) break seek;
            }

            right = pp.length;
            break linear_scan;
          }

          if (!(t >= t0)) {
            const t1global = pp[1];

            if (t < t1global) {
              i1 = 2; // + 1, using the scan for the details
              t0 = t1global;
            }

            for (let giveUpAt = i1 - 2; ; ) {
              if (t0 === undefined) {
                this._cachedIndex = 0;
                return this.copySampleValue_(0);
              }

              if (i1 === giveUpAt) break;

              t1 = t0;
              t0 = pp[--i1 - 1];

              if (t >= t0) break seek;
            }

            right = i1;
            i1 = 0;
            break linear_scan;
          }

          break validate_interval;
        }

        while (i1 < right) {
          const mid = (i1 + right) >>> 1;
          if (t < pp[mid]) right = mid;
          else i1 = mid + 1;
        }

        t1 = pp[i1];
        t0 = pp[i1 - 1];

        if (t0 === undefined) {
          this._cachedIndex = 0;
          return this.copySampleValue_(0);
        }

        if (t1 === undefined) {
          i1 = pp.length;
          this._cachedIndex = i1;
          return this.copySampleValue_(i1 - 1);
        }
      }

      this._cachedIndex = i1;
      this.intervalChanged_(i1, t0, t1);
    }

    return this.interpolate_(i1, t0, t, t1);
  }

  getSettings_(): Settings {
    return this.settings ?? this.DefaultSettings_;
  }

  copySampleValue_(index: number) {
    const offset = index * this.valueSize;
    for (let i = 0; i !== this.valueSize; ++i) this.resultBuffer[i] = this.sampleValues[offset + i];
    return this.resultBuffer;
  }

  abstract interpolate_(i1: number, t0: number, t: number, t1: number): TypedArray;
  intervalChanged_(i1: number, t0: number, t1: number): void {}
}
