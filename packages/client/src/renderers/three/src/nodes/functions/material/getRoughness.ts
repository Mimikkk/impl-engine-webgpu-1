import { getGeometryRoughness } from './getGeometryRoughness.js';
import { tslFn } from '../../shadernode/ShaderNode.js';

export const getRoughness = tslFn(inputs => {
  const { roughness } = inputs;

  const geometryRoughness = getGeometryRoughness();

  // 0.0525 corresponds to the base mip of a 256 cubemap.
  let roughnessFactor = roughness.max(0.0525);
  roughnessFactor = roughnessFactor.add(geometryRoughness);
  roughnessFactor = roughnessFactor.min(1.0);

  return roughnessFactor;
});
