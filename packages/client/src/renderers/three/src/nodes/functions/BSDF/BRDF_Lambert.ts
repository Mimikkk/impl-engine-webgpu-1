import { tslFn } from '../../shadernode/ShaderNode.js';

export const BRDF_Lambert = tslFn(({ diffuseColor }) => diffuseColor.mul(1 / Math.PI));
