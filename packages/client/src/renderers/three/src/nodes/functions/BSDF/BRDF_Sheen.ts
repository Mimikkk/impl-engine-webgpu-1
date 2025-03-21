import { NormalNodes } from '../../accessors/NormalNode.js';
import { PositionNodes } from '../../accessors/PositionNode.js';
import { PropertyNodes } from '../../core/PropertyNode.js';
import { float, tslFn } from '../../shadernode/ShaderNode.js';

// https://github.com/google/filament/blob/master/shaders/src/brdf.fs
export const D_Charlie = (roughness, dotNH) => {
  const alpha = roughness.pow2();

  // Estevez and Kulla 2017, "Production Friendly Microfacet Sheen BRDF"
  const invAlpha = float(1.0).div(alpha);
  const cos2h = dotNH.pow2();
  const sin2h = cos2h.oneMinus().max(0.0078125); // 2^(-14/2), so sin2h^2 > 0 in fp16

  return float(2.0)
    .add(invAlpha)
    .mul(sin2h.pow(invAlpha.mul(0.5)))
    .div(2.0 * Math.PI);
};

// https://github.com/google/filament/blob/master/shaders/src/brdf.fs
export const V_Neubelt = (dotNV, dotNL) => {
  // Neubelt and Pettineo 2013, "Crafting a Next-gen Material Pipeline for The Order: 1886"
  return float(1.0).div(float(4.0).mul(dotNL.add(dotNV).sub(dotNL.mul(dotNV))));
};

export const BRDF_Sheen = tslFn(({ lightDirection }) => {
  const halfDir = lightDirection.add(PositionNodes.directional.view).normalize();

  const dotNL = NormalNodes.transformed.view.dot(lightDirection).clamp();
  const dotNV = NormalNodes.transformed.view.dot(PositionNodes.directional.view).clamp();
  const dotNH = NormalNodes.transformed.view.dot(halfDir).clamp();

  const D = D_Charlie(PropertyNodes.sheenRoughness, dotNH);
  const V = V_Neubelt(dotNV, dotNL);

  return PropertyNodes.sheen.mul(D).mul(V);
});
