import { NormalNodes } from '../../accessors/NormalNode.js';
import { tslFn } from '../../shadernode/ShaderNode.js';

const getGeometryRoughness = tslFn(() => {
  const dxy = NormalNodes.geometry.dFdx().abs().max(NormalNodes.geometry.dFdy().abs());
  const geometryRoughness = dxy.x.max(dxy.y).max(dxy.z);

  return geometryRoughness;
});

export default getGeometryRoughness;
