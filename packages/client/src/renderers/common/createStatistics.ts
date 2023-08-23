import { Renderer } from '../webgpu/createRenderer.js';
interface RenderObject {
  isMesh?: boolean;
  isSprite?: boolean;
  isPoints?: boolean;
  isLineSegments?: boolean;
  isLine?: boolean;
}

export interface Statistics {
  memory: { textures: number; geometries: number };
  render: { triangles: number; calls: number; lines: number; frame: number; points: number };
  autoReset: boolean;
  update(renderObject: RenderObject, vertexCount: number, instanceCount: number): void;
  reset(): void;
  dispose(): void;
}

export const createStatistics = (renderer: Renderer): Statistics => {
  const autoReset = true;
  const render = { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 };
  const memory = { geometries: 0, textures: 0 };

  return {
    autoReset,
    render,
    memory,
    update({ isMesh, isSprite, isPoints, isLineSegments, isLine }, vertexCount, instanceCount) {
      ++render.calls;

      if (isMesh || isSprite) {
        render.triangles += instanceCount * (vertexCount / 3);
      } else if (isPoints) {
        render.points += instanceCount * vertexCount;
      } else if (isLineSegments) {
        render.lines += instanceCount * (vertexCount / 2);
      } else if (isLine) {
        render.lines += instanceCount * (vertexCount - 1);
      }
    },
    reset() {
      render.calls = 0;
      render.triangles = 0;
      render.points = 0;
      render.lines = 0;
    },
    dispose() {
      this.reset();
      render.frame = 0;
      memory.geometries = 0;
      memory.textures = 0;
    },
  };
};
