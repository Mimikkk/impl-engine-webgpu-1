import { DFGApprox } from './DFGApprox.js';
import { tslFn } from '../../shadernode/ShaderNode.js';

export const EnvironmentBRDF = tslFn(({ dotNV, specularColor, specularF90, roughness }) => {
  const fab = DFGApprox({ dotNV, roughness });
  return specularColor.mul(fab.x).add(specularF90.mul(fab.y));
});
