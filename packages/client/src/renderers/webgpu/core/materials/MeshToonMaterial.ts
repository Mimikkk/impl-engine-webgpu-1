import { TangentSpaceNormalMap } from '../../common/Constants.js';
import { Material } from './Material.js';
import { Vector2 } from '../Vector2.js';
import { Color } from '../Color.js';

export class MeshToonMaterial extends Material {
  isMeshToonMaterial: boolean;
  defines: { TOON: string };
  color: Color;
  map: null;
  gradientMap: null;
  lightMapIntensity: number;
  lightMap: null;
  aoMap: null;
  aoMapIntensity: number;
  fog: boolean;
  wireframeLinejoin: string;
  wireframeLinecap: string;
  wireframe: boolean;
  wireframeLinewidth: number;
  alphaMap: null;
  displacementBias: number;
  displacementMap: null;
  displacementScale: number;
  normalScale: Vector2;
  normalMapType: number;
  normalMap: null;
  bumpScale: number;
  bumpMap: null;
  emissiveMap: null;
  emissiveIntensity: number;
  emissive: Color;
  constructor(parameters?: any) {
    super();

    this.isMeshToonMaterial = true;

    this.defines = { TOON: '' };

    this.type = 'MeshToonMaterial';

    this.color = new Color(0xffffff);

    this.map = null;
    this.gradientMap = null;

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

    this.alphaMap = null;

    this.wireframe = false;
    this.wireframeLinewidth = 1;
    this.wireframeLinecap = 'round';
    this.wireframeLinejoin = 'round';

    this.fog = true;

    this.setValues(parameters);
  }

  copy(source: MeshToonMaterial) {
    super.copy(source);

    this.color.copy(source.color);

    this.map = source.map;
    this.gradientMap = source.gradientMap;

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

    this.alphaMap = source.alphaMap;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    this.wireframeLinecap = source.wireframeLinecap;
    this.wireframeLinejoin = source.wireframeLinejoin;

    this.fog = source.fog;

    return this;
  }
}
