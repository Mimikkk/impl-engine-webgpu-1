import { DisplayP3ColorSpace, LinearSRGBColorSpace, SRGBColorSpace } from '../common/Constants.js';
import { Matrix3 } from './Matrix3.js';
import type { Color } from './Color.js';

export const SRGBToLinear = (c: number) =>
  c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);

export const LinearToSRGB = (c: number) => (c < 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055);

const LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = /*@__PURE__*/ new Matrix3().fromArray([
  0.8224621, 0.0331941, 0.0170827, 0.177538, 0.9668058, 0.0723974, -0.0000001, 0.0000001, 0.9105199,
]);

const LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = /*@__PURE__*/ new Matrix3().fromArray([
  1.2249401, -0.0420569, -0.0196376, -0.2249404, 1.0420571, -0.0786361, 0.0000001, 0.0, 1.0982735,
]);

// Display P3 uses the sRGB transfer functions
const DisplayP3ToLinearSRGB = (color: Color) =>
  color.convertSRGBToLinear().applyMatrix3(LINEAR_DISPLAY_P3_TO_LINEAR_SRGB);

// Display P3 uses the sRGB transfer functions
const LinearSRGBToDisplayP3 = (color: Color) =>
  color.applyMatrix3(LINEAR_SRGB_TO_LINEAR_DISPLAY_P3).convertLinearToSRGB();

// Conversions from <source> to Linear-sRGB reference space.
const TO_LINEAR = {
  [LinearSRGBColorSpace]: (color: Color) => color,
  [SRGBColorSpace]: (color: Color) => color.convertSRGBToLinear(),
  [DisplayP3ColorSpace]: DisplayP3ToLinearSRGB,
};

// Conversions to <target> from Linear-sRGB reference space.
const FROM_LINEAR = {
  [LinearSRGBColorSpace]: (color: Color) => color,
  [SRGBColorSpace]: (color: Color) => color.convertLinearToSRGB(),
  [DisplayP3ColorSpace]: LinearSRGBToDisplayP3,
};
export type ColorSpace = keyof typeof TO_LINEAR;

export const ColorManagement = {
  enabled: true,

  get legacyMode() {
    console.warn('THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150.');

    return !this.enabled;
  },

  set legacyMode(legacyMode) {
    console.warn('THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150.');

    this.enabled = !legacyMode;
  },

  get workingColorSpace() {
    return LinearSRGBColorSpace;
  },

  set workingColorSpace(colorSpace: ColorSpace) {
    console.warn('THREE.ColorManagement: .workingColorSpace is readonly.');
  },

  convert(color: Color, source: ColorSpace, target: ColorSpace) {
    if (!this.enabled || source === target || !source || !target) return color;

    const sourceToLinear = TO_LINEAR[source];
    const targetFromLinear = FROM_LINEAR[target];

    if (sourceToLinear === undefined || targetFromLinear === undefined) {
      throw new Error(`Unsupported color space conversion, "${source}" to "${target}".`);
    }

    return targetFromLinear(sourceToLinear(color));
  },

  fromWorkingColorSpace(color: Color, target: ColorSpace) {
    return this.convert(color, this.workingColorSpace, target);
  },

  toWorkingColorSpace(color: Color, source: ColorSpace) {
    return this.convert(color, source, this.workingColorSpace);
  },
};
