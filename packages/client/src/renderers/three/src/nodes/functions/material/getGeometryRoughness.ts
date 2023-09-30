import { NormalNodes } from '../../accessors/NormalNode.js';
import { tslFn } from '../../shadernode/ShaderNode.js';

export const getGeometryRoughness = tslFn(() => {
  const dxy = NormalNodes.geometry.dFdx().abs().max(NormalNodes.geometry.dFdy().abs());
  return dxy.x.max(dxy.y).max(dxy.z);
});
