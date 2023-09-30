import { tslFn } from '../../shadernode/ShaderNode.js';

// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
export const D_GGX = tslFn(({ alpha, dotNH }) => {
  const a2 = alpha.pow2();

  return a2.div(dotNH.pow2().mul(a2.oneMinus()).oneMinus().pow2()).mul(1 / Math.PI);
});
