import { MultiplyOperation, TangentSpaceNormalMap } from '../../common/Constants.js';
import { Material } from './Material.js';
import { Vector2 } from '../Vector2.js';
import { Color } from '../Color.js';

export class MeshPhongMaterial extends Material {
  isMeshPhongMaterial: boolean;
  color: Color;
  specular: Color;
  shininess: number;
  map: null;
  lightMap: null;
  lightMapIntensity: number;
  aoMap: null;
  aoMapIntensity: number;
  emissiveIntensity: number;
  emissive: Color;
  emissiveMap: null;
  bumpMap: null;
  bumpScale: number;
  normalMap: null;
  normalMapType: number;
  normalScale: Vector2;
  displacementMap: null;
  displacementScale: number;
  displacementBias: number;
  specularMap: null;
  alphaMap: null;
  envMap: null;
  combine: number;
  reflectivity: number;
  refractionRatio: number;
  wireframe: boolean;
  wireframeLinewidth: number;
  wireframeLinecap: string;
  wireframeLinejoin: string;
  flatShading: boolean;
  fog: boolean;
  constructor(parameters?: any) {
    super();

    this.isMeshPhongMaterial = true;

    this.type = 'MeshPhongMaterial';

    this.color = new Color(0xffffff); // diffuse
    this.specular = new Color(0x111111);
    this.shininess = 30;

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

    this.specularMap = null;

    this.alphaMap = null;

    this.envMap = null;
    this.combine = MultiplyOperation;
    this.reflectivity = 1;
    this.refractionRatio = 0.98;

    this.wireframe = false;
    this.wireframeLinewidth = 1;
    this.wireframeLinecap = 'round';
    this.wireframeLinejoin = 'round';

    this.flatShading = false;

    this.fog = true;

    this.setValues(parameters);
  }

  copy(source: MeshPhongMaterial) {
    super.copy(source);

    this.color.copy(source.color);
    this.specular.copy(source.specular);
    this.shininess = source.shininess;

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

    this.specularMap = source.specularMap;

    this.alphaMap = source.alphaMap;

    this.envMap = source.envMap;
    this.combine = source.combine;
    this.reflectivity = source.reflectivity;
    this.refractionRatio = source.refractionRatio;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    this.wireframeLinecap = source.wireframeLinecap;
    this.wireframeLinejoin = source.wireframeLinejoin;

    this.flatShading = source.flatShading;

    this.fog = source.fog;

    return this;
  }
}
