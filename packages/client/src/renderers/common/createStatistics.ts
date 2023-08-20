interface RenderObject {
  isMesh?: boolean;
  isSprite?: boolean;
  isPoints?: boolean;
  isLineSegments?: boolean;
  isLine?: boolean;
}

export const createStatistics = () => {
  const autoReset = true;
  const render = { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 };
  const memory = { geometries: 0, textures: 0 };

  return {
    autoReset,
    get render() {
      return render;
    },
    get memory() {
      return memory;
    },
    update(
      { isMesh, isSprite, isPoints, isLineSegments, isLine }: RenderObject,
      vertexCount: number,
      instanceCount: number,
    ) {
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
