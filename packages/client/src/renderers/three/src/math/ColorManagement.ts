import { DisplayP3ColorSpace, LinearSRGBColorSpace, SRGBColorSpace } from '../constants.js';
import { Matrix3 } from './Matrix3.js';
import { Color } from './Color.js';
import { ColorSpace } from './types.js';

export function SRGBToLinear(c: number): number {
  return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
}

export function LinearToSRGB(c: number): number {
  return c < 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055;
}

const LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = new Matrix3().fromArray([
  0.8224621, 0.0331941, 0.0170827, 0.177538, 0.9668058, 0.0723974, -0.0000001, 0.0000001, 0.9105199,
]);

const LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = new Matrix3().fromArray([
  1.2249401, -0.0420569, -0.0196376, -0.2249404, 1.0420571, -0.0786361, 0.0000001, 0.0, 1.0982735,
]);

function DisplayP3ToLinearSRGB(color: Color): Color {
  // Display P3 uses the sRGB transfer functions
  return color.convertSRGBToLinear().applyMatrix3(LINEAR_DISPLAY_P3_TO_LINEAR_SRGB);
}

function LinearSRGBToDisplayP3(color: Color): Color {
  // Display P3 uses the sRGB transfer functions
  return color.applyMatrix3(LINEAR_SRGB_TO_LINEAR_DISPLAY_P3).convertLinearToSRGB();
}

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

export const ColorManagement = {
  enabled: true,

  get legacyMode() {
    console.warn('THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150.');

    return !this.enabled;
  },

  set legacyMode(legacyMode: boolean) {
    console.warn('THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150.');

    this.enabled = !legacyMode;
  },

  get workingColorSpace(): ColorSpace {
    return LinearSRGBColorSpace;
  },

  set workingColorSpace(colorSpace: ColorSpace) {
    console.warn('THREE.ColorManagement: .workingColorSpace is readonly.');
  },

  convert: function (color: Color, sourceColorSpace: ColorSpace, targetColorSpace: ColorSpace): Color {
    if (this.enabled === false || sourceColorSpace === targetColorSpace || !sourceColorSpace || !targetColorSpace) {
      return color;
    }

    const sourceToLinear = TO_LINEAR[sourceColorSpace];
    const targetFromLinear = FROM_LINEAR[targetColorSpace];

    if (sourceToLinear === undefined || targetFromLinear === undefined) {
      throw new Error(`Unsupported color space conversion, "${sourceColorSpace}" to "${targetColorSpace}".`);
    }

    return targetFromLinear(sourceToLinear(color));
  },

  fromWorkingColorSpace: function (color: Color, targetColorSpace: ColorSpace): Color {
    return this.convert(color, this.workingColorSpace, targetColorSpace);
  },

  toWorkingColorSpace: function (color: Color, sourceColorSpace: ColorSpace): Color {
    return this.convert(color, sourceColorSpace, this.workingColorSpace);
  },
};
