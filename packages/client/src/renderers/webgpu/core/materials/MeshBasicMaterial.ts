import { Material } from './Material.js';
import { MultiplyOperation } from '../../common/Constants.js';
import { Color } from '../Color.js';

export class MeshBasicMaterial extends Material {
  isMeshBasicMaterial: boolean;
  color: Color;
  map: null;
  lightMap: null;
  lightMapIntensity: number;
  aoMap: null;
  aoMapIntensity: number;
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
  fog: boolean;
  constructor(parameters?: any) {
    super();

    this.isMeshBasicMaterial = true;
    this.type = 'MeshBasicMaterial';

    // emissive
    this.color = new Color(0xffffff);

    this.map = null;

    this.lightMap = null;
    this.lightMapIntensity = 1.0;

    this.aoMap = null;
    this.aoMapIntensity = 1.0;

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

    this.fog = true;

    this.setValues(parameters);
  }

  copy(source: MeshBasicMaterial) {
    super.copy(source);

    this.color.copy(source.color);

    this.map = source.map;

    this.lightMap = source.lightMap;
    this.lightMapIntensity = source.lightMapIntensity;

    this.aoMap = source.aoMap;
    this.aoMapIntensity = source.aoMapIntensity;

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

    this.fog = source.fog;

    return this;
  }
}
