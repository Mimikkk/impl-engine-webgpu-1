import { Vector4 } from 'three';

let id = 0;

export interface RenderContext {
  clearStencilValue: number;
  color: boolean;
  clearDepthValue: number;
  scissor: boolean;
  texture: null;
  depthTexture: null;
  sampleCount: number;
  clearColor: boolean;
  depth: boolean;
  viewport: boolean;
  clearColorValue: { a: number; r: number; b: number; g: number };
  activeCubeFace: number;
  clearDepth: boolean;
  clearStencil: boolean;
  id: number;
  stencil: boolean;
  scissorValue: Vector4;
  viewportValue: Vector4;
}

export const createRenderContext = (): RenderContext => ({
  id: ++id,
  color: true,
  clearColor: true,
  clearColorValue: { r: 0, g: 0, b: 0, a: 1 },

  depth: true,
  clearDepth: true,
  clearDepthValue: 1,

  stencil: true,
  clearStencil: true,
  clearStencilValue: 1,

  viewport: false,
  viewportValue: new Vector4(),

  scissor: false,
  scissorValue: new Vector4(),

  texture: null,
  depthTexture: null,
  activeCubeFace: 0,
  sampleCount: 1,
});
