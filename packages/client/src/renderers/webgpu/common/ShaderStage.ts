import { withFlagMethods } from '@typings/withFlagMethods.js';

export enum ShaderStage {
  None = 0,
  Vertex = GPUShaderStage.VERTEX,
  Compute = GPUShaderStage.COMPUTE,
  Fragment = GPUShaderStage.FRAGMENT,
}

export namespace ShaderStage {
  export const { toNames, toValues, toString } = withFlagMethods<ShaderStage>(ShaderStage);
}
