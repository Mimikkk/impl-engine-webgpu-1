import LightingModel from '../core/LightingModel.js';
import F_Schlick from './BSDF/F_Schlick.js';
import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import { diffuseColor, shininess, specularColor } from '../core/PropertyNode.js';
import { NormalNodes } from '../accessors/NormalNode.js';
import { materialSpecularStrength } from '../accessors/MaterialNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { float, tslFn } from '../shadernode/ShaderNode.js';

const G_BlinnPhong_Implicit = () => float(0.25);

const D_BlinnPhong = tslFn(({ dotNH }) => {
  return shininess
    .mul(0.5 / Math.PI)
    .add(1.0)
    .mul(dotNH.pow(shininess));
});

const BRDF_BlinnPhong = tslFn(({ lightDirection }) => {
  const halfDir = lightDirection.add(PositionNodes.directional.view).normalize();

  const dotNH = NormalNodes.transformed.view.dot(halfDir).clamp();
  const dotVH = PositionNodes.directional.view.dot(halfDir).clamp();

  const F = F_Schlick({ f0: specularColor, f90: 1.0, dotVH });
  const G = G_BlinnPhong_Implicit();
  const D = D_BlinnPhong({ dotNH });

  return F.mul(G).mul(D);
});

class PhongLightingModel extends LightingModel {
  constructor(specular = true) {
    super();

    this.specular = specular;
  }

  direct({ lightDirection, lightColor, reflectedLight }) {
    const dotNL = NormalNodes.transformed.view.dot(lightDirection).clamp();
    const irradiance = dotNL.mul(lightColor);

    reflectedLight.directDiffuse.addAssign(irradiance.mul(BRDF_Lambert({ diffuseColor: diffuseColor.rgb })));

    if (this.specular === true) {
      reflectedLight.directSpecular.addAssign(
        irradiance.mul(BRDF_BlinnPhong({ lightDirection })).mul(materialSpecularStrength),
      );
    }
  }

  indirectDiffuse({ irradiance, reflectedLight }) {
    reflectedLight.indirectDiffuse.addAssign(irradiance.mul(BRDF_Lambert({ diffuseColor })));
  }
}

export default PhongLightingModel;
