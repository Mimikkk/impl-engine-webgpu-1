import { TangentSpaceNormalMap } from '../../common/Constants.js';
import { Material } from './Material.js';
import { Vector2 } from '../Vector2.js';
import { Color } from '../Color.js';

export class MeshStandardMaterial extends Material {
  isMeshStandardMaterial: boolean;
  defines: { STANDARD: string };
  color: Color;
  metalness: number;
  roughness: number;
  map: null;
  lightMap: null;
  lightMapIntensity: number;
  aoMap: null;
  aoMapIntensity: number;
  emissive: Color;
  emissiveIntensity: number;
  emissiveMap: null;
  bumpMap: null;
  bumpScale: number;
  normalMap: null;
  normalMapType: number;
  normalScale: Vector2;
  displacementScale: number;
  displacementMap: null;
  displacementBias: number;
  roughnessMap: null;
  metalnessMap: null;
  alphaMap: null;
  envMap: null;
  envMapIntensity: number;
  wireframe: boolean;
  wireframeLinewidth: number;
  wireframeLinecap: string;
  wireframeLinejoin: string;
  flatShading: boolean;
  fog: boolean;
  constructor(parameters?: any) {
    super();

    this.isMeshStandardMaterial = true;

    this.defines = { STANDARD: '' };

    this.type = 'MeshStandardMaterial';

    this.color = new Color(0xffffff); // diffuse
    this.roughness = 1.0;
    this.metalness = 0.0;

    this.map = null;

    this.lightMap = null;
    this.lightMapIntensity = 1.0;

    this.aoMap = null;
    this.aoMapIntensity = 1.0;

    this.emissive = new Color(0x000000);
    this.emissiveIntensity = 1.0;
    this.emissiveMap = null;

    this.bumpMap = null;
    this.bumpScale = 1;

    this.normalMap = null;
    this.normalMapType = TangentSpaceNormalMap;
    this.normalScale = new Vector2(1, 1);

    this.displacementMap = null;
    this.displacementScale = 1;
    this.displacementBias = 0;

    this.roughnessMap = null;

    this.metalnessMap = null;

    this.alphaMap = null;

    this.envMap = null;
    this.envMapIntensity = 1.0;

    this.wireframe = false;
    this.wireframeLinewidth = 1;
    this.wireframeLinecap = 'round';
    this.wireframeLinejoin = 'round';

    this.flatShading = false;

    this.fog = true;

    this.setValues(parameters);
  }

  copy(source: MeshStandardMaterial) {
    super.copy(source);

    this.defines = { STANDARD: '' };

    this.color.copy(source.color);
    this.roughness = source.roughness;
    this.metalness = source.metalness;

    this.map = source.map;

    this.lightMap = source.lightMap;
    this.lightMapIntensity = source.lightMapIntensity;

    this.aoMap = source.aoMap;
    this.aoMapIntensity = source.aoMapIntensity;

    this.emissive.copy(source.emissive);
    this.emissiveMap = source.emissiveMap;
    this.emissiveIntensity = source.emissiveIntensity;

    this.bumpMap = source.bumpMap;
    this.bumpScale = source.bumpScale;

    this.normalMap = source.normalMap;
    this.normalMapType = source.normalMapType;
    this.normalScale.copy(source.normalScale);

    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;

    this.roughnessMap = source.roughnessMap;

    this.metalnessMap = source.metalnessMap;

    this.alphaMap = source.alphaMap;

    this.envMap = source.envMap;
    this.envMapIntensity = source.envMapIntensity;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    this.wireframeLinecap = source.wireframeLinecap;
    this.wireframeLinejoin = source.wireframeLinejoin;

    this.flatShading = source.flatShading;

    this.fog = source.fog;

    return this;
  }
}
