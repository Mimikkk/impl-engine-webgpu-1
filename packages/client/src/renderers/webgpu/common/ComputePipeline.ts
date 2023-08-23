export const createComputePipeline = (cacheKey: string, computeProgram: any) => ({
  cacheKey,
  computeProgram,
  usedTimes: 0,
  isComputePipeline: true,
});
