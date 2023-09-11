import {
  DisplayP3ColorSpace,
  LinearSRGBColorSpace,
  NoColorSpace,
  WebGLCoordinateSystem,
  WebGPUCoordinateSystem,
} from 'three/src/constants.js';
import { SRGBColorSpace } from '../constants.js';

export type ColorSpace =
  | typeof NoColorSpace
  | typeof SRGBColorSpace
  | typeof LinearSRGBColorSpace
  | typeof DisplayP3ColorSpace;

export type CoordinateSystem = typeof WebGLCoordinateSystem | typeof WebGPUCoordinateSystem;
