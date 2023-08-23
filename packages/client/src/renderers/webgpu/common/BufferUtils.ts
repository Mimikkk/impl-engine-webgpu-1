import { Std140ChunkBytes } from './Constants.js';

export const getFloatLength = (floatLength: number) =>
  floatLength + ((Std140ChunkBytes - (floatLength % Std140ChunkBytes)) % Std140ChunkBytes);

export const getVectorLength = (count: number, vectorLength: number = 4) =>
  getFloatLength(getStrideLength(vectorLength) * count);

export const getStrideLength = (length: number) => length + ((4 - (length % 4)) % 4);
