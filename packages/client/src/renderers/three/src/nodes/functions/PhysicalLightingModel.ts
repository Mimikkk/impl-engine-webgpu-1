import { BRDF_Lambert } from './BSDF/BRDF_Lambert.js';
import { BRDF_GGX } from './BSDF/BRDF_GGX.js';
import { DFGApprox } from './BSDF/DFGApprox.js';
import { EnvironmentBRDF } from './BSDF/EnvironmentBRDF.js';
import { F_Schlick } from './BSDF/F_Schlick.js';
import { Schlick_to_F0 } from './BSDF/Schlick_to_F0.js';
import { BRDF_Sheen } from './BSDF/BRDF_Sheen.js';
import { LightingModel } from '../core/LightingModel.js';
import { PropertyNodes } from '../core/PropertyNode.js';
import { NormalNodes } from '../accessors/NormalNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { float, mat3, vec3 } from '../shadernode/ShaderNode.js';
import { cond } from '../math/CondNode.js';
import { mix, smoothstep } from '../math/MathNode.js';

// XYZ to linear-sRGB color space
const XyzToLinearSRgb = mat3(
  3.2404542,
  -0.969266,
  0.0556434,
  -1.5371385,
  1.8760108,
  -0.2040259,
  -0.4985314,
  0.041556,
  1.0572252,
);

const Fresnel0ToIor = fresnel0 => {
  const sqrtF0 = fresnel0.sqrt();
  return vec3(1.0).add(sqrtF0).div(vec3(1.0).sub(sqrtF0));
};
const IorToFresnel0 = (transmittedIor, incidentIor) => {
  return transmittedIor.sub(incidentIor).div(transmittedIor.add(incidentIor)).pow2();
};
const evalSensitivity = (OPD, shift) => {
  const phase = OPD.mul(2.0 * Math.PI * 1.0e-9);
  const val = vec3(5.4856e-13, 4.4201e-13, 5.2481e-13);
  const pos = vec3(1.681e6, 1.7953e6, 2.2084e6);
  const VAR = vec3(4.3278e9, 9.3046e9, 6.6121e9);

  const x = float(9.747e-14 * Math.sqrt(2.0 * Math.PI * 4.5282e9))
    .mul(phase.mul(2.2399e6).add(shift.x).cos())
    .mul(phase.pow2().mul(-4.5282e9).exp());

  let xyz = val
    .mul(VAR.mul(2.0 * Math.PI).sqrt())
    .mul(pos.mul(phase).add(shift).cos())
    .mul(phase.pow2().negate().mul(VAR).exp());
  xyz = vec3(xyz.x.add(x), xyz.y, xyz.z).div(1.0685e-7);

  const rgb = XyzToLinearSRgb.mul(xyz);
  return rgb;
};
const evalIridescence = (outsideIOR, eta2, cosTheta1, thinFilmThickness, baseF0) => {
  // Force iridescenceIOR -> outsideIOR when thinFilmThickness -> 0.0
  const iridescenceIOR = mix(outsideIOR, eta2, smoothstep(0.0, 0.03, thinFilmThickness));
  // Evaluate the cosTheta on the base layer (Snell law)
  const sinTheta2Sq = outsideIOR.div(iridescenceIOR).pow2().mul(float(1).sub(cosTheta1.pow2()));

  // Handle TIR:
  const cosTheta2Sq = float(1).sub(sinTheta2Sq);
  /*if ( cosTheta2Sq < 0.0 ) {

   return vec3( 1.0 );

   }*/

  const cosTheta2 = cosTheta2Sq.sqrt();

  // First interface
  const R0 = IorToFresnel0(iridescenceIOR, outsideIOR);
  const R12 = F_Schlick({ f0: R0, f90: 1.0, dotVH: cosTheta1 });
  //const R21 = R12;
  const T121 = R12.oneMinus();
  const phi12 = iridescenceIOR.lessThan(outsideIOR).cond(Math.PI, 0.0);
  const phi21 = float(Math.PI).sub(phi12);

  // Second interface
  const baseIOR = Fresnel0ToIor(baseF0.clamp(0.0, 0.9999)); // guard against 1.0
  const R1 = IorToFresnel0(baseIOR, iridescenceIOR.vec3());
  const R23 = F_Schlick({ f0: R1, f90: 1.0, dotVH: cosTheta2 });
  const phi23 = vec3(
    baseIOR.x.lessThan(iridescenceIOR).cond(Math.PI, 0.0),
    baseIOR.y.lessThan(iridescenceIOR).cond(Math.PI, 0.0),
    baseIOR.z.lessThan(iridescenceIOR).cond(Math.PI, 0.0),
  );

  // Phase shift
  const OPD = iridescenceIOR.mul(thinFilmThickness, cosTheta2, 2.0);
  const phi = vec3(phi21).add(phi23);

  // Compound terms
  const R123 = R12.mul(R23).clamp(1e-5, 0.9999);
  const r123 = R123.sqrt();
  const Rs = T121.pow2().mul(R23).div(vec3(1.0).sub(R123));

  // Reflectance term for m = 0 (DC term amplitude)
  const C0 = R12.add(Rs);
  let I = C0;

  // Reflectance term for m > 0 (pairs of diracs)
  let Cm = Rs.sub(T121);
  for (let m = 1; m <= 2; ++m) {
    Cm = Cm.mul(r123);
    const Sm = evalSensitivity(float(m).mul(OPD), float(m).mul(phi)).mul(2.0);
    I = I.add(Cm.mul(Sm));
  }

  // Since out of gamut colors might be produced, negative color values are clamped to 0.
  return I.max(vec3(0.0));
};
const IBLSheenBRDF = (normal, viewDir, roughness) => {
  const dotNV = normal.dot(viewDir).saturate();

  const r2 = roughness.pow2();

  const a = cond(
    roughness.lessThan(0.25),
    float(-339.2).mul(r2).add(float(161.4).mul(roughness)).sub(25.9),
    float(-8.48).mul(r2).add(float(14.3).mul(roughness)).sub(9.95),
  );

  const b = cond(
    roughness.lessThan(0.25),
    float(44.0).mul(r2).sub(float(23.7).mul(roughness)).add(3.26),
    float(1.97).mul(r2).sub(float(3.27).mul(roughness)).add(0.72),
  );

  const DG = cond(roughness.lessThan(0.25), 0.0, float(0.1).mul(roughness).sub(0.025)).add(a.mul(dotNV).add(b).exp());

  return DG.mul(1.0 / Math.PI).saturate();
};

const clearcoatF0 = vec3(0.04);
const clearcoatF90 = vec3(1);

export class PhysicalLightingModel extends LightingModel {
  clearcoat: boolean;
  sheen: boolean;
  iridescence: boolean;

  constructor(clearcoat: boolean = true, sheen: boolean = true, iridescence: boolean = true) {
    super();

    this.clearcoat = clearcoat;
    this.sheen = sheen;
    this.iridescence = iridescence;

    this.clearcoatRadiance = null;
    this.clearcoatSpecular = null;
    this.sheenSpecular = null;
    this.iridescenceFresnel = null;
    this.iridescenceF0 = null;
  }

  init({ reflectedLight }) {
    if (this.clearcoat === true) {
      this.clearcoatRadiance = vec3().temp();
      this.clearcoatSpecular = vec3().temp();

      const dotNVcc = NormalNodes.transformed.clearcoat.dot(PositionNodes.directional.view).clamp();

      const Fcc = F_Schlick({
        dotVH: dotNVcc,
        f0: clearcoatF0,
        f90: clearcoatF90,
      });

      const outgoingLight = reflectedLight.total;
      const clearcoatLight = outgoingLight
        .mul(PropertyNodes.clearcoat.mul(Fcc).oneMinus())
        .add(this.clearcoatSpecular.mul(PropertyNodes.clearcoat));

      outgoingLight.assign(clearcoatLight);
    }

    if (this.sheen === true) {
      this.sheenSpecular = vec3().temp();

      const outgoingLight = reflectedLight.total;

      const sheenEnergyComp = PropertyNodes.sheen.r
        .max(PropertyNodes.sheen.g)
        .max(PropertyNodes.sheen.b)
        .mul(0.157)
        .oneMinus();
      const sheenLight = outgoingLight.mul(sheenEnergyComp).add(this.sheenSpecular);

      outgoingLight.assign(sheenLight);
    }

    if (this.iridescence === true) {
      const dotNVi = NormalNodes.transformed.view.dot(PositionNodes.directional.view).clamp();

      this.iridescenceFresnel = evalIridescence(
        float(1.0),
        PropertyNodes.iridescenceIOR,
        dotNVi,
        PropertyNodes.iridescenceThickness,
        PropertyNodes.specularColor,
      );
      this.iridescenceF0 = Schlick_to_F0({ f: this.iridescenceFresnel, f90: 1.0, dotVH: dotNVi });
    }
  }

  // Fdez-Agüera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
  // Approximates multiscattering in order to preserve energy.
  // http://www.jcgt.org/published/0008/01/03/

  computeMultiscattering(singleScatter, multiScatter, specularF90 = float(1)) {
    const fab = DFGApprox({ roughness: PropertyNodes.roughness });

    const Fr = this.iridescenceF0
      ? PropertyNodes.iridescence.mix(PropertyNodes.specularColor, this.iridescenceF0)
      : PropertyNodes.specularColor;

    const FssEss = Fr.mul(fab.x).add(specularF90.mul(fab.y));

    const Ess = fab.x.add(fab.y);
    const Ems = Ess.oneMinus();

    const Favg = PropertyNodes.specularColor.add(PropertyNodes.specularColor.oneMinus().mul(0.047619)); // 1/21
    const Fms = FssEss.mul(Favg).div(Ems.mul(Favg).oneMinus());

    singleScatter.addAssign(FssEss);
    multiScatter.addAssign(Fms.mul(Ems));
  }

  direct({ lightDirection, lightColor, reflectedLight }) {
    const dotNL = NormalNodes.transformed.view.dot(lightDirection).clamp();
    const irradiance = dotNL.mul(lightColor);

    if (this.sheen === true) {
      this.sheenSpecular.addAssign(irradiance.mul(BRDF_Sheen({ lightDirection })));
    }

    if (this.clearcoat === true) {
      const dotNLcc = NormalNodes.transformed.clearcoat.dot(lightDirection).clamp();
      const ccIrradiance = dotNLcc.mul(lightColor);

      this.clearcoatSpecular.addAssign(
        ccIrradiance.mul(
          BRDF_GGX({
            lightDirection,
            f0: clearcoatF0,
            f90: clearcoatF90,
            roughness: PropertyNodes.clearcoatRoughness,
            normalView: NormalNodes.transformed.clearcoat,
          }),
        ),
      );
    }

    reflectedLight.directDiffuse.addAssign(
      irradiance.mul(BRDF_Lambert({ diffuseColor: PropertyNodes.diffuseColor.rgb })),
    );

    reflectedLight.directSpecular.addAssign(
      irradiance.mul(
        BRDF_GGX({
          lightDirection,
          f0: PropertyNodes.specularColor,
          f90: 1,
          roughness: PropertyNodes.roughness,
          iridescence: this.iridescence,
          iridescenceFresnel: this.iridescenceFresnel,
        }),
      ),
    );
  }

  indirectDiffuse({ irradiance, reflectedLight }) {
    reflectedLight.indirectDiffuse.addAssign(
      irradiance.mul(BRDF_Lambert({ diffuseColor: PropertyNodes.diffuseColor })),
    );
  }

  indirectSpecular({ radiance, iblIrradiance, reflectedLight }) {
    if (this.sheen === true) {
      this.sheenSpecular.addAssign(
        iblIrradiance.mul(
          PropertyNodes.sheen,
          IBLSheenBRDF(NormalNodes.transformed.view, PositionNodes.directional.view, PropertyNodes.sheenRoughness),
        ),
      );
    }

    if (this.clearcoat === true) {
      const dotNVcc = NormalNodes.transformed.clearcoat.dot(PositionNodes.directional.view).clamp();

      const clearcoatEnv = EnvironmentBRDF({
        dotNV: dotNVcc,
        specularColor: clearcoatF0,
        specularF90: clearcoatF90,
        roughness: PropertyNodes.clearcoatRoughness,
      });

      this.clearcoatSpecular.addAssign(this.clearcoatRadiance.mul(clearcoatEnv));
    }

    // Both indirect specular and indirect diffuse light accumulate here

    const singleScattering = vec3().temp();
    const multiScattering = vec3().temp();
    const cosineWeightedIrradiance = iblIrradiance.mul(1 / Math.PI);

    this.computeMultiscattering(singleScattering, multiScattering);

    const totalScattering = singleScattering.add(multiScattering);

    const diffuse = PropertyNodes.diffuseColor.mul(
      totalScattering.r.max(totalScattering.g).max(totalScattering.b).oneMinus(),
    );

    reflectedLight.indirectSpecular.addAssign(radiance.mul(singleScattering));
    reflectedLight.indirectSpecular.addAssign(multiScattering.mul(cosineWeightedIrradiance));

    reflectedLight.indirectDiffuse.addAssign(diffuse.mul(cosineWeightedIrradiance));
  }

  ambientOcclusion({ ambientOcclusion, reflectedLight }) {
    const dotNV = NormalNodes.transformed.view.dot(PositionNodes.directional.view).clamp(); // @ TODO: Move to core dotNV

    const aoNV = dotNV.add(ambientOcclusion);
    const aoExp = PropertyNodes.roughness.mul(-16.0).oneMinus().negate().exp2();

    const aoNode = ambientOcclusion.sub(aoNV.pow(aoExp).oneMinus()).clamp();

    reflectedLight.indirectDiffuse.mulAssign(ambientOcclusion);

    reflectedLight.indirectSpecular.mulAssign(aoNode);
  }
}
