import { BlendColorFactor, OneMinusBlendColorFactor } from '../common/Constants.js';

import {
  GPUBlendFactor,
  GPUBlendOperation,
  GPUColorWriteFlags,
  GPUCompareFunction,
  GPUCullMode,
  GPUFrontFace,
  GPUIndexFormat,
  GPUStencilOperation,
} from './constants.js';

import {
  AddEquation,
  AdditiveBlending,
  AlwaysDepth,
  AlwaysStencilFunc,
  BackSide,
  CustomBlending,
  DecrementStencilOp,
  DecrementWrapStencilOp,
  DoubleSide,
  DstAlphaFactor,
  DstColorFactor,
  EqualDepth,
  EqualStencilFunc,
  FrontSide,
  GreaterDepth,
  GreaterEqualDepth,
  GreaterEqualStencilFunc,
  GreaterStencilFunc,
  IncrementStencilOp,
  IncrementWrapStencilOp,
  InvertStencilOp,
  KeepStencilOp,
  LessDepth,
  LessEqualDepth,
  LessEqualStencilFunc,
  LessStencilFunc,
  MaxEquation,
  MinEquation,
  MultiplyBlending,
  NeverDepth,
  NeverStencilFunc,
  NormalBlending,
  NotEqualDepth,
  NotEqualStencilFunc,
  OneFactor,
  OneMinusDstAlphaFactor,
  OneMinusDstColorFactor,
  OneMinusSrcAlphaFactor,
  OneMinusSrcColorFactor,
  ReplaceStencilOp,
  ReverseSubtractEquation,
  SrcAlphaFactor,
  SrcAlphaSaturateFactor,
  SrcColorFactor,
  SubtractEquation,
  SubtractiveBlending,
  ZeroFactor,
  ZeroStencilOp,
} from 'three';
import { Organizer } from '../createOrganizer.js';

const findColorWriteMask = ({ colorWrite }: any) => (colorWrite ? GPUColorWriteFlags.All : GPUColorWriteFlags.None);
const findDepthCompare = ({ depthFunc, depthTest }: any) => {
  if (!depthTest) return GPUCompareFunction.Always;

  switch (depthFunc) {
    case NeverDepth:
      return GPUCompareFunction.Never;
    case AlwaysDepth:
      return GPUCompareFunction.Always;
    case LessDepth:
      return GPUCompareFunction.Less;
    case LessEqualDepth:
      return GPUCompareFunction.LessEqual;
    case EqualDepth:
      return GPUCompareFunction.Equal;
    case GreaterEqualDepth:
      return GPUCompareFunction.GreaterEqual;
    case GreaterDepth:
      return GPUCompareFunction.Greater;
    case NotEqualDepth:
      return GPUCompareFunction.NotEqual;
    default:
      console.error('THREE.WebGPUPipelineUtils: Invalid depth function.', depthFunc);
  }
};
const findBlendOperation = (blendEquation: any) => {
  switch (blendEquation) {
    case AddEquation:
      return GPUBlendOperation.Add;
    case SubtractEquation:
      return GPUBlendOperation.Subtract;
    case ReverseSubtractEquation:
      return GPUBlendOperation.ReverseSubtract;
    case MinEquation:
      return GPUBlendOperation.Min;
    case MaxEquation:
      return GPUBlendOperation.Max;
    default:
      console.error('THREE.WebGPUPipelineUtils: Blend equation not supported.', blendEquation);
  }
};
const findStencilOperation = (operation: any) => {
  switch (operation) {
    case KeepStencilOp:
      return GPUStencilOperation.Keep;
    case ZeroStencilOp:
      return GPUStencilOperation.Zero;
    case ReplaceStencilOp:
      return GPUStencilOperation.Replace;
    case InvertStencilOp:
      return GPUStencilOperation.Invert;
    case IncrementStencilOp:
      return GPUStencilOperation.IncrementClamp;
    case DecrementStencilOp:
      return GPUStencilOperation.DecrementClamp;
    case IncrementWrapStencilOp:
      return GPUStencilOperation.IncrementWrap;
    case DecrementWrapStencilOp:
      return GPUStencilOperation.DecrementWrap;
    default:
      console.error('THREE.WebGPURenderer: Invalid stencil operation.', operation);
  }
};
const findStencilCompare = ({ stencilFunc }: any) => {
  switch (stencilFunc) {
    case NeverStencilFunc:
      return GPUCompareFunction.Never;
    case AlwaysStencilFunc:
      return GPUCompareFunction.Always;
    case LessStencilFunc:
      return GPUCompareFunction.Less;
    case LessEqualStencilFunc:
      return GPUCompareFunction.LessEqual;
    case EqualStencilFunc:
      return GPUCompareFunction.Equal;
    case GreaterEqualStencilFunc:
      return GPUCompareFunction.GreaterEqual;
    case GreaterStencilFunc:
      return GPUCompareFunction.Greater;
    case NotEqualStencilFunc:
      return GPUCompareFunction.NotEqual;
    default:
      console.error('THREE.WebGPURenderer: Invalid stencil function.', stencilFunc);
  }
};
const findBlendFactor = (blend: any) => {
  switch (blend) {
    case ZeroFactor:
      return GPUBlendFactor.Zero;
    case OneFactor:
      return GPUBlendFactor.One;
    case SrcColorFactor:
      return GPUBlendFactor.Src;
    case OneMinusSrcColorFactor:
      return GPUBlendFactor.OneMinusSrc;
    case SrcAlphaFactor:
      return GPUBlendFactor.SrcAlpha;
    case OneMinusSrcAlphaFactor:
      return GPUBlendFactor.OneMinusSrcAlpha;
    case DstColorFactor:
      return GPUBlendFactor.Dst;
    case OneMinusDstColorFactor:
      return GPUBlendFactor.OneMinusDstColor;
    case DstAlphaFactor:
      return GPUBlendFactor.DstAlpha;
    case OneMinusDstAlphaFactor:
      return GPUBlendFactor.OneMinusDstAlpha;
    case SrcAlphaSaturateFactor:
      return GPUBlendFactor.SrcAlphaSaturated;
    case BlendColorFactor:
      return GPUBlendFactor.Constant;
    case OneMinusBlendColorFactor:
      return GPUBlendFactor.OneMinusConstant;
    default:
      console.error('THREE.WebGPURenderer: Blend factor not supported.', blend);
  }
};
const findBlending = ({
  blending,
  blendSrc,
  blendDst,
  blendEquation,
  blendSrcAlpha,
  blendDstAlpha,
  blendEquationAlpha,
  premultipliedAlpha,
}: any) => {
  const { SrcAlpha, One, Src, Zero, OneMinusSrcAlpha, OneMinusSrc } = GPUBlendFactor;
  const { Add } = GPUBlendOperation;
  const create = (srcRgb: any, dstRgb: any, srcAlpha: any, dstAlpha: any, srcOp = Add, dstOp = Add) => ({
    color: { srcFactor: srcRgb, dstFactor: dstRgb, operation: srcOp },
    alpha: { srcFactor: srcAlpha, dstFactor: dstAlpha, operation: dstOp },
  });

  if (blending === CustomBlending)
    return create(
      findBlendFactor(blendSrc),
      findBlendFactor(blendDst),
      findBlendFactor(blendSrcAlpha ? blendSrcAlpha : One),
      findBlendFactor(blendDstAlpha ? blendDstAlpha : Zero),
      findBlendOperation(blendEquation),
      blendEquationAlpha ? findBlendOperation(blendEquationAlpha) : Add,
    );

  if (premultipliedAlpha) {
    switch (blending) {
      case NormalBlending:
        return create(SrcAlpha, OneMinusSrcAlpha, One, OneMinusSrcAlpha);
      case AdditiveBlending:
        return create(SrcAlpha, One, One, One);
      case SubtractiveBlending:
        return create(Zero, OneMinusSrc, Zero, One);
      case MultiplyBlending:
        return create(Zero, Src, Zero, SrcAlpha);
    }
  }

  switch (blending) {
    case NormalBlending:
      return create(SrcAlpha, OneMinusSrcAlpha, One, OneMinusSrcAlpha);
    case AdditiveBlending:
      return create(SrcAlpha, One, SrcAlpha, One);
    case SubtractiveBlending:
      return create(Zero, OneMinusSrc, Zero, One);
    case MultiplyBlending:
      return create(Zero, Src, Zero, Src);
  }

  console.error('THREE.WebGPURenderer: Invalid blending: ', blending);
};

export const createPipelinesState = (backend: Organizer) => {
  const findPrimitiveState = (object: any, geometry: any, material: any) => {
    const topology = backend.utilities.findPrimitiveTopology(object, material);
    const stripIndexFormat =
      object.isLine && !object.isLineSegments
        ? (geometry.index ? geometry.index.count : geometry.attributes.position.count) > 0xffff
          ? GPUIndexFormat.Uint32
          : GPUIndexFormat.Uint16
        : undefined;
    const frontFace = GPUFrontFace.CW;

    const create = (cullMode: any) => ({ topology, stripIndexFormat, frontFace, cullMode });

    switch (material.side) {
      case FrontSide:
        return create(GPUCullMode.Front);
      case BackSide:
        return create(GPUCullMode.Back);
      case DoubleSide:
        return create(GPUCullMode.None);
      default:
        console.error('THREE.WebGPUPipelineUtils: Unknown material.side value.', material.side);
    }
  };

  return {
    createRender: (renderObject: any) => {
      const {
        object,
        material,
        geometry,
        pipeline: { vertexProgram, fragmentProgram },
        pipeline,
        context,
      } = renderObject;

      (backend.get(pipeline) as any).pipeline = backend.device!.createRenderPipeline({
        vertex: Object.assign({}, (backend.get(vertexProgram) as any).module, {
          buffers: backend.attributes.createShaderVertexBuffers(renderObject),
        }),
        fragment: Object.assign({}, (backend.get(fragmentProgram) as any).module, {
          targets: [
            {
              format: backend.utilities.findCurrentColorFormat(context),
              blend: material.transparent && material.blending ? findBlending(material) : undefined,
              writeMask: findColorWriteMask(material),
            },
          ],
        }),
        primitive: findPrimitiveState(object, geometry, material) as any,
        depthStencil: {
          format: backend.utilities.findCurrentDepthStencilFormat(context),
          depthWriteEnabled: material.depthWrite,
          depthCompare: findDepthCompare(material) as any,
          stencilFront: material.stencilWrite
            ? {
                compare: findStencilCompare(material),
                failOp: findStencilOperation(material.stencilFail),
                depthFailOp: findStencilOperation(material.stencilZFail),
                passOp: findStencilOperation(material.stencilZPass),
              }
            : ({} as any),
          stencilBack: {},
          stencilReadMask: material.stencilFuncMask,
          stencilWriteMask: material.stencilWriteMask,
        },
        multisample: {
          count: backend.utilities.findSampleCount(renderObject.context),
          alphaToCoverageEnabled: material.alphaToCoverage,
        },
        layout: backend.device!.createPipelineLayout({
          bindGroupLayouts: [(backend.get(renderObject.getBindings()) as any).layout],
        }),
      });
    },
    createCompute: (pipeline: any, bindings: any) => {
      (backend.get(pipeline) as any).pipeline = backend.device!.createComputePipeline({
        compute: (backend.get(pipeline.computeProgram) as any).module,
        layout: backend.device!.createPipelineLayout({ bindGroupLayouts: [(backend.get(bindings) as any).layout] }),
      });
    },
  };
};
