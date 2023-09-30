import { LightingModel } from '../core/LightingModel.js';
import { F_Schlick } from './BSDF/F_Schlick.js';
import { BRDF_Lambert } from './BSDF/BRDF_Lambert.js';
import { PropertyNodes } from '../core/PropertyNode.js';
import { NormalNodes } from '../accessors/NormalNode.js';
import { MaterialNodes } from '../accessors/MaterialNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { float, tslFn } from '../shadernode/ShaderNode.js';

const G_BlinnPhong_Implicit = () => float(0.25);

const D_BlinnPhong = tslFn(({ dotNH }) => {
  return PropertyNodes.shininess
    .mul(0.5 / Math.PI)
    .add(1.0)
    .mul(dotNH.pow(PropertyNodes.shininess));
});

const BRDF_BlinnPhong = tslFn(({ lightDirection }) => {
  const halfDir = lightDirection.add(PositionNodes.directional.view).normalize();

  const dotNH = NormalNodes.transformed.view.dot(halfDir).clamp();
  const dotVH = PositionNodes.directional.view.dot(halfDir).clamp();

  const F = F_Schlick({ f0: PropertyNodes.specularColor, f90: 1.0, dotVH });
  const G = G_BlinnPhong_Implicit();
  const D = D_BlinnPhong({ dotNH });

  return F.mul(G).mul(D);
});

export class PhongLightingModel extends LightingModel {
  specular: boolean;

  constructor(specular: boolean = true) {
    super();
    this.specular = specular;
  }

  direct({ lightDirection, lightColor, reflectedLight }: any) {
    const dotNL = NormalNodes.transformed.view.dot(lightDirection).clamp();
    const irradiance = dotNL.mul(lightColor);

    reflectedLight.directDiffuse.addAssign(
      irradiance.mul(BRDF_Lambert({ diffuseColor: PropertyNodes.diffuseColor.rgb })),
    );

    if (this.specular) {
      reflectedLight.directSpecular.addAssign(
        irradiance.mul(BRDF_BlinnPhong({ lightDirection })).mul(MaterialNodes.specularStrength),
      );
    }
  }

  indirectDiffuse({ irradiance, reflectedLight }: any) {
    reflectedLight.indirectDiffuse.addAssign(
      irradiance.mul(BRDF_Lambert({ diffuseColor: PropertyNodes.diffuseColor })),
    );
  }
}
