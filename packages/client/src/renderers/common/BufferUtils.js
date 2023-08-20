import { Std140ChunkBytes } from './Constants.ts';

export const getFloatLength = floatLength =>
  floatLength + ((Std140ChunkBytes - (floatLength % Std140ChunkBytes)) % Std140ChunkBytes);

export const getVectorLength = (count, vectorLength = 4) => getFloatLength(getStrideLength(vectorLength) * count);

export const getStrideLength = length => length + ((4 - (length % 4)) % 4);
