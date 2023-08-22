import { GPUPrimitiveTopology, GPUTextureFormat } from './constants.js';
import { Organizer } from '../createOrganizer.js';

export const createUtilitiesState = (backend: Organizer) => {
  const self = {
    findCurrentDepthStencilFormat: ({ depthTexture, depth, stencil }: any) => {
      if (depthTexture) return self.findTextureFormatGPU(depthTexture);

      if (depth) {
        if (stencil) return GPUTextureFormat.Depth24PlusStencil8;
        return GPUTextureFormat.Depth24Plus;
      }
    },
    findTextureFormatGPU: (texture: any) => (backend.get(texture) as any).texture.format,
    findCurrentColorFormat: ({ texture }: any) =>
      texture ? self.findTextureFormatGPU(texture) : GPUTextureFormat.BGRA8Unorm,
    findCurrentColorSpace: ({ texture }: any) => texture?.colorSpace ?? backend.renderer.outputColorSpace,
    findPrimitiveTopology: ({ isPoints, isLineSegments, isLine, isMesh }: any, { wireframe: isWireframe }: any) => {
      if (isPoints) return GPUPrimitiveTopology.PointList;
      if (isLine) return GPUPrimitiveTopology.LineStrip;
      if (isMesh) return GPUPrimitiveTopology.TriangleList;
      if (isLineSegments || (isMesh && isWireframe)) return GPUPrimitiveTopology.LineList;
    },
    findSampleCount: ({ texture, sampleCount }: any) => (texture ? sampleCount : backend.parameters.sampleCount),
  };

  return self;
};
