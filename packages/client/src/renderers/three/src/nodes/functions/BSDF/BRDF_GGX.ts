import { F_Schlick } from './F_Schlick.js';
import { V_GGX_SmithCorrelated } from './V_GGX_SmithCorrelated.js';
import { D_GGX } from './D_GGX.js';
import { NormalNodes } from '../../accessors/NormalNode.js';
import { PositionNodes } from '../../accessors/PositionNode.js';
import { PropertyNodes } from '../../core/PropertyNode.js';
import { tslFn } from '../../shadernode/ShaderNode.js';

// GGX Distribution, Schlick Fresnel, GGX_SmithCorrelated Visibility
export const BRDF_GGX = tslFn(({ lightDirection, f0, f90, roughness, iridescenceFresnel, normalView }) => {
  normalView ??= NormalNodes.transformed.view;

  const alpha = roughness.pow2(); // UE4's roughness

  const halfDir = lightDirection.add(PositionNodes.directional.view).normalize();

  const dotNL = normalView.dot(lightDirection).clamp();
  const dotNV = normalView.dot(PositionNodes.directional.view).clamp(); // @ TODO: Move to core dotNV
  const dotNH = normalView.dot(halfDir).clamp();
  const dotVH = PositionNodes.directional.view.dot(halfDir).clamp();

  let F = F_Schlick({ f0, f90, dotVH });

  if (iridescenceFresnel) {
    F = PropertyNodes.iridescence.mix(F, iridescenceFresnel);
  }

  const V = V_GGX_SmithCorrelated({ alpha, dotNL, dotNV });
  const D = D_GGX({ alpha, dotNH });

  return F.mul(V).mul(D);
});
