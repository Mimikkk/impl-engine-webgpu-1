import { GPUPrimitiveTopology, GPUTextureFormat } from './constants.js';

export const createUtilitiesState = backend => {
	const self = {
		findCurrentDepthStencilFormat: ({ depthTexture, depth, stencil }) => {
			if (depthTexture) return self.findTextureFormatGPU(depthTexture);

			if (depth) {
				if (stencil) return GPUTextureFormat.Depth24PlusStencil8;
				return GPUTextureFormat.Depth24Plus;
			}
		},
		findTextureFormatGPU: texture => backend.get(texture).texture.format,
		findCurrentColorFormat: ({ texture }) =>
			texture ? self.findTextureFormatGPU(texture) : GPUTextureFormat.BGRA8Unorm,
		findCurrentColorSpace: ({ texture }) => texture?.colorSpace ?? backend.renderer.outputColorSpace,
		findPrimitiveTopology: ({ isPoints, isLineSegments, isLine, isMesh }, { wireframe: isWireframe }) => {
			if (isPoints) return GPUPrimitiveTopology.PointList;
			if (isLine) return GPUPrimitiveTopology.LineStrip;
			if (isMesh) return GPUPrimitiveTopology.TriangleList;
			if (isLineSegments || (isMesh && isWireframe)) return GPUPrimitiveTopology.LineList;
		},
		findSampleCount: ({ texture, sampleCount }) => (texture ? sampleCount : backend.parameters.sampleCount),
	};

	return self;
};
