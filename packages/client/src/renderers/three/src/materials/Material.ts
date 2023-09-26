import { EventDispatcher } from '../core/EventDispatcher.js';
import {
  AddEquation,
  AlwaysStencilFunc,
  FrontSide,
  KeepStencilOp,
  LessEqualDepth,
  NormalBlending,
  OneMinusSrcAlphaFactor,
  SrcAlphaFactor,
} from '../constants.js';
import { MathUtils } from '../math/MathUtils.js';
import type {
  Blending,
  BlendingDstFactor,
  BlendingEquation,
  BlendingSrcFactor,
  DepthModes,
  PixelFormat,
  Side,
  StencilFunc,
  StencilOp,
} from '../constants.js';
import { Plane } from '../math/Plane.js';
import { ColorRepresentation } from '../math/Color.js';

let materialId = 0;

export class Material extends EventDispatcher<'dispose'> {
  alphaHash: boolean;
  alphaToCoverage: boolean;
  blendDst: BlendingDstFactor;
  blendDstAlpha: number | null;
  blendEquation: BlendingEquation;
  blendEquationAlpha: number | null;
  blending: Blending;
  blendSrc: BlendingSrcFactor | BlendingDstFactor;
  blendSrcAlpha: number | null;
  clipIntersection: boolean;
  clippingPlanes: null | Plane[];
  clipShadows: boolean;
  colorWrite: boolean;
  defines: undefined | { [key: string]: any };
  depthFunc: DepthModes;
  depthTest: boolean;
  depthWrite: boolean;
  id: number;
  stencilWrite: boolean;
  stencilFunc: StencilFunc;
  stencilRef: number;
  stencilWriteMask: number;
  stencilFuncMask: number;
  stencilFail: StencilOp;
  stencilZFail: StencilOp;
  stencilZPass: StencilOp;
  readonly isMaterial: true;
  name: string;
  opacity: number;
  polygonOffset: boolean;
  polygonOffsetFactor: number;
  polygonOffsetUnits: number;
  precision: 'highp' | 'mediump' | 'lowp' | null;
  premultipliedAlpha: boolean;
  forceSinglePass: boolean;
  dithering: boolean;
  side: Side;
  shadowSide: Side | null;
  toneMapped: boolean;
  transparent: boolean;
  type: string;
  uuid: string;
  vertexColors: boolean;
  visible: boolean;
  userData: any;
  version: number;
  _alphaTest: number;
  declare ['constructor']: typeof Material;

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

  set needsUpdate(value: boolean) {
    if (value) this.version++;
  }

  onBuild(/* shaderobject, renderer */) {}

  onBeforeRender(/* renderer, scene, camera, geometry, object, group */) {}

  onBeforeCompile(/* shaderobject, renderer */) {}

  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }

  setValues(values?: Material.Parameters) {
    if (values === undefined) return;

    for (const key in values) {
      const newValue = values[key as keyof typeof values];

      if (newValue === undefined) {
        console.warn(`THREE.Material: parameter '${key}' has value of undefined.`);
        continue;
      }

      const currentValue = this[key as keyof typeof this];

      if (currentValue === undefined) {
        console.warn(`THREE.Material: '${key}' is not a property of THREE.${this.type}.`);
        continue;
      }

      //@ts-expect-error
      if (currentValue && currentValue.isColor) {
        //@ts-expect-error
        currentValue.set(newValue);
        //@ts-expect-error
      } else if (currentValue && currentValue.isVector3 && newValue && newValue.isVector3) {
        //@ts-expect-error
        currentValue.copy(newValue);
      } else {
        //@ts-expect-error
        this[key] = newValue;
      }
    }
  }

  clone() {
    return new this.constructor().copy(this);
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
    this.dispatchEvent({ type: 'dispose' });
  }
}

export namespace Material {
  export interface Parameters {
    color?: ColorRepresentation;
    alphaHash?: boolean | undefined;
    alphaTest?: number | undefined;
    alphaToCoverage?: boolean | undefined;
    blendDst?: BlendingDstFactor | undefined;
    blendDstAlpha?: number | undefined;
    blendEquation?: BlendingEquation | undefined;
    blendEquationAlpha?: number | undefined;
    blending?: Blending | undefined;
    blendSrc?: BlendingSrcFactor | BlendingDstFactor | undefined;
    blendSrcAlpha?: number | undefined;
    clipIntersection?: boolean | undefined;
    clippingPlanes?: Plane[] | undefined;
    clipShadows?: boolean | undefined;
    colorWrite?: boolean | undefined;
    defines?: any;
    depthFunc?: DepthModes | undefined;
    depthTest?: boolean | undefined;
    depthWrite?: boolean | undefined;
    name?: string | undefined;
    opacity?: number | undefined;
    polygonOffset?: boolean | undefined;
    polygonOffsetFactor?: number | undefined;
    polygonOffsetUnits?: number | undefined;
    precision?: 'highp' | 'mediump' | 'lowp' | null | undefined;
    premultipliedAlpha?: boolean | undefined;
    forceSinglePass?: boolean | undefined;
    dithering?: boolean | undefined;
    side?: Side | undefined;
    shadowSide?: Side | undefined;
    toneMapped?: boolean | undefined;
    transparent?: boolean | undefined;
    vertexColors?: boolean | undefined;
    visible?: boolean | undefined;
    format?: PixelFormat | undefined;
    stencilWrite?: boolean | undefined;
    stencilFunc?: StencilFunc | undefined;
    stencilRef?: number | undefined;
    stencilWriteMask?: number | undefined;
    stencilFuncMask?: number | undefined;
    stencilFail?: StencilOp | undefined;
    stencilZFail?: StencilOp | undefined;
    stencilZPass?: StencilOp | undefined;
    userData?: any;
  }
}
