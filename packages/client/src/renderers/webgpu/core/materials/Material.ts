import { EventDispatcher } from '../EventDispatcher.js';
import {
  AddEquation,
  AlwaysStencilFunc,
  FrontSide,
  KeepStencilOp,
  LessEqualDepth,
  NormalBlending,
  OneMinusSrcAlphaFactor,
  SrcAlphaFactor,
} from '../../common/Constants.js';
import { MathUtils } from '../MathUtils.js';
import { Plane } from '../Plane.js';
import { Color } from '../Color.js';
import { Vector3 } from '../Vector3.js';

let materialId = 0;

export class Material extends EventDispatcher {
  isMaterial: boolean;
  uuid: string;
  name: string;
  type: string;
  blending: number;

  side: number;
  opacity: number;
  vertexColors: boolean;
  transparent: boolean;
  blendDstAlpha: null;
  blendSrcAlpha: null;
  blendEquation: number;
  blendDst: number;
  blendSrc: number;
  _alphaTest: number;
  version: number;
  userData: {};
  toneMapped: boolean;
  visible: boolean;
  forceSinglePass: boolean;
  premultipliedAlpha: boolean;
  alphaToCoverage: boolean;
  dithering: boolean;
  polygonOffsetUnits: number;
  polygonOffsetFactor: number;
  polygonOffset: boolean;
  precision: null;
  colorWrite: boolean;
  shadowSide: null;
  clipShadows: boolean;
  clipIntersection: boolean;
  clippingPlanes: Plane[] | null;
  alphaHash: boolean;
  blendEquationAlpha: null;
  depthFunc: number;
  depthTest: boolean;
  depthWrite: boolean;
  stencilWriteMask: number;
  stencilFunc: number;
  stencilRef: number;
  stencilZFail: number;
  stencilFuncMask: number;
  stencilFail: number;
  stencilZPass: number;
  stencilWrite: boolean;
  materials?: Material[];

  constructor() {
    super();

    this.isMaterial = true;
    Object.defineProperty(this, 'id', { value: materialId++ });

    this.uuid = MathUtils.generateUUID();

    this.name = '';
    this.type = 'Material';

    this.blending = NormalBlending;
    this.side = FrontSide;
    this.vertexColors = false;

    this.opacity = 1;
    this.transparent = false;
    this.alphaHash = false;

    this.blendSrc = SrcAlphaFactor;
    this.blendDst = OneMinusSrcAlphaFactor;
    this.blendEquation = AddEquation;
    this.blendSrcAlpha = null;
    this.blendDstAlpha = null;
    this.blendEquationAlpha = null;

    this.depthFunc = LessEqualDepth;
    this.depthTest = true;
    this.depthWrite = true;

    this.stencilWriteMask = 0xff;
    this.stencilFunc = AlwaysStencilFunc;
    this.stencilRef = 0;
    this.stencilFuncMask = 0xff;
    this.stencilFail = KeepStencilOp;
    this.stencilZFail = KeepStencilOp;
    this.stencilZPass = KeepStencilOp;
    this.stencilWrite = false;

    this.clippingPlanes = null;
    this.clipIntersection = false;
    this.clipShadows = false;

    this.shadowSide = null;

    this.colorWrite = true;

    this.precision = null; // override the renderer's default precision for this material

    this.polygonOffset = false;
    this.polygonOffsetFactor = 0;
    this.polygonOffsetUnits = 0;

    this.dithering = false;

    this.alphaToCoverage = false;
    this.premultipliedAlpha = false;
    this.forceSinglePass = false;

    this.visible = true;

    this.toneMapped = true;

    this.userData = {};

    this.version = 0;

    this._alphaTest = 0;
  }

  get alphaTest() {
    return this._alphaTest;
  }

  set alphaTest(value) {
    if (this._alphaTest > 0 !== value > 0) {
      this.version++;
    }

    this._alphaTest = value;
  }

  onBuild(/* shaderobject, renderer */) {}

  onBeforeRender(/* renderer, scene, camera, geometry, object, group */) {}

  onBeforeCompile(/* shaderobject, renderer */) {}

  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }

  setValues(values: Record<keyof this, any>) {
    if (values === undefined) return;

    for (const key in values) {
      const newValue: any = values[key];

      if (newValue === undefined) {
        console.warn(`THREE.Material: parameter '${key}' has value of undefined.`);
        continue;
      }

      const currentValue = this[key];

      if (currentValue === undefined) {
        console.warn(`THREE.Material: '${key}' is not a property of THREE.${this.type}.`);
        continue;
      }

      if (currentValue instanceof Color) {
        currentValue.set(newValue);
      } else if (currentValue instanceof Vector3 && newValue instanceof Vector3) {
        currentValue.copy(newValue);
      } else {
        this[key] = newValue;
      }
    }
  }

  clone() {
    return new Material().copy(this);
  }

  copy(source: Material) {
    this.name = source.name;

    this.blending = source.blending;
    this.side = source.side;
    this.vertexColors = source.vertexColors;

    this.opacity = source.opacity;
    this.transparent = source.transparent;

    this.blendSrc = source.blendSrc;
    this.blendDst = source.blendDst;
    this.blendEquation = source.blendEquation;
    this.blendSrcAlpha = source.blendSrcAlpha;
    this.blendDstAlpha = source.blendDstAlpha;
    this.blendEquationAlpha = source.blendEquationAlpha;

    this.depthFunc = source.depthFunc;
    this.depthTest = source.depthTest;
    this.depthWrite = source.depthWrite;

    this.stencilWriteMask = source.stencilWriteMask;
    this.stencilFunc = source.stencilFunc;
    this.stencilRef = source.stencilRef;
    this.stencilFuncMask = source.stencilFuncMask;
    this.stencilFail = source.stencilFail;
    this.stencilZFail = source.stencilZFail;
    this.stencilZPass = source.stencilZPass;
    this.stencilWrite = source.stencilWrite;

    const srcPlanes = source.clippingPlanes;
    let dstPlanes = null;

    if (srcPlanes !== null) {
      const n = srcPlanes.length;
      dstPlanes = new Array(n);

      for (let i = 0; i !== n; ++i) {
        dstPlanes[i] = srcPlanes[i].clone();
      }
    }

    this.clippingPlanes = dstPlanes;
    this.clipIntersection = source.clipIntersection;
    this.clipShadows = source.clipShadows;

    this.shadowSide = source.shadowSide;

    this.colorWrite = source.colorWrite;

    this.precision = source.precision;

    this.polygonOffset = source.polygonOffset;
    this.polygonOffsetFactor = source.polygonOffsetFactor;
    this.polygonOffsetUnits = source.polygonOffsetUnits;

    this.dithering = source.dithering;

    this.alphaTest = source.alphaTest;
    this.alphaHash = source.alphaHash;
    this.alphaToCoverage = source.alphaToCoverage;
    this.premultipliedAlpha = source.premultipliedAlpha;
    this.forceSinglePass = source.forceSinglePass;

    this.visible = source.visible;

    this.toneMapped = source.toneMapped;

    this.userData = JSON.parse(JSON.stringify(source.userData));

    return this;
  }

  dispose() {
    this.dispatchEvent({ target: null, type: 'dispose' });
  }

  set needsUpdate(value: boolean) {
    if (value) this.version++;
  }
}
