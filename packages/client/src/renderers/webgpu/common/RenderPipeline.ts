export const createRenderPipeline = (cacheKey: string, vertexProgram: any, fragmentProgram: any) => ({
  cacheKey,
  vertexProgram,
  fragmentProgram,
  usedTimes: 0,
});
