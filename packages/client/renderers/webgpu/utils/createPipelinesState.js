import { BlendColorFactor, OneMinusBlendColorFactor } from '../../common/Constants.js';

import {
	GPUFrontFace,
	GPUCullMode,
	GPUColorWriteFlags,
	GPUCompareFunction,
	GPUBlendFactor,
	GPUBlendOperation,
	GPUIndexFormat,
	GPUStencilOperation,
} from './constants.js';

import {
	FrontSide,
	BackSide,
	DoubleSide,
	NeverDepth,
	AlwaysDepth,
	LessDepth,
	LessEqualDepth,
	EqualDepth,
	GreaterEqualDepth,
	GreaterDepth,
	NotEqualDepth,
	NoBlending,
	NormalBlending,
	AdditiveBlending,
	SubtractiveBlending,
	MultiplyBlending,
	CustomBlending,
	ZeroFactor,
	OneFactor,
	SrcColorFactor,
	OneMinusSrcColorFactor,
	SrcAlphaFactor,
	OneMinusSrcAlphaFactor,
	DstColorFactor,
	OneMinusDstColorFactor,
	DstAlphaFactor,
	OneMinusDstAlphaFactor,
	SrcAlphaSaturateFactor,
	AddEquation,
	SubtractEquation,
	ReverseSubtractEquation,
	MinEquation,
	MaxEquation,
	KeepStencilOp,
	ZeroStencilOp,
	ReplaceStencilOp,
	InvertStencilOp,
	IncrementStencilOp,
	DecrementStencilOp,
	IncrementWrapStencilOp,
	DecrementWrapStencilOp,
	NeverStencilFunc,
	AlwaysStencilFunc,
	LessStencilFunc,
	LessEqualStencilFunc,
	EqualStencilFunc,
	GreaterEqualStencilFunc,
	GreaterStencilFunc,
	NotEqualStencilFunc,
} from 'three';

const findColorWriteMask = ({ colorWrite }) => (colorWrite ? GPUColorWriteFlags.All : GPUColorWriteFlags.None);
const findDepthCompare = ({ depthFunc, depthTest }) => {
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
const findBlendOperation = blendEquation => {
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
const findStencilOperation = operation => {
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
			console.error('THREE.WebGPURenderer: Invalid stencil operation.', stencilOperation);
	}
};
const findStencilCompare = ({ stencilFunc }) => {
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
const findBlendFactor = blend => {
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
}) => {
	const { SrcAlpha, One, Src, Zero, OneMinusSrcAlpha, OneMinusSrc } = GPUBlendFactor;
	const { Add } = GPUBlendOperation;
	const create = (srcRgb, dstRgb, srcAlpha, dstAlpha, srcOp = Add, dstOp = Add) => ({
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

export const createPipelinesState = backend => {
	const findPrimitiveState = (object, geometry, material) => {
		const topology = backend.utilites.findPrimitiveTopology(object, material);
		const stripIndexFormat =
			object.isLine && !object.isLineSegments
				? (geometry.index ? geometry.index.count : geometry.attributes.position.count) > 0xffff
					? GPUIndexFormat.Uint32
					: GPUIndexFormat.Uint16
				: undefined;
		const frontFace = GPUFrontFace.CW;

		const create = cullMode => ({ topology, stripIndexFormat, frontFace, cullMode });

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
		createRender: renderObject => {
			const {
				object,
				material,
				geometry,
				pipeline: { vertexProgram, fragmentProgram },
				pipeline,
				context,
			} = renderObject;

			backend.get(pipeline).pipeline = backend.device.createRenderPipeline({
				vertex: Object.assign({}, backend.get(vertexProgram).module, {
					buffers: backend.attributes.createShaderVertexBuffers(renderObject),
				}),
				fragment: Object.assign({}, backend.get(fragmentProgram).module, {
					targets: [
						{
							format: backend.utilites.findCurrentColorFormat(context),
							blend: material.transparent && material.blending ? findBlending(material) : undefined,
							writeMask: findColorWriteMask(material),
						},
					],
				}),
				primitive: findPrimitiveState(object, geometry, material),
				depthStencil: {
					format: backend.utilites.findCurrentDepthStencilFormat(context),
					depthWriteEnabled: material.depthWrite,
					depthCompare: findDepthCompare(material),
					stencilFront: material.stencilWrite
						? {
								compare: findStencilCompare(material),
								failOp: findStencilOperation(material.stencilFail),
								depthFailOp: findStencilOperation(material.stencilZFail),
								passOp: findStencilOperation(material.stencilZPass),
						  }
						: {},
					stencilBack: {},
					stencilReadMask: material.stencilFuncMask,
					stencilWriteMask: material.stencilWriteMask,
				},
				multisample: {
					count: backend.utilites.findSampleCount(renderObject.context),
					alphaToCoverageEnabled: material.alphaToCoverage,
				},
				layout: backend.device.createPipelineLayout({
					bindGroupLayouts: [backend.get(renderObject.getBindings()).layout],
				}),
			});
		},
		createCompute: (pipeline, bindings) => {
			backend.get(pipeline).pipeline = backend.device.createComputePipeline({
				compute: backend.get(pipeline.computeProgram).module,
				layout: backend.device.createPipelineLayout({ bindGroupLayouts: [backend.get(bindings).layout] }),
			});
		},
	};
};
