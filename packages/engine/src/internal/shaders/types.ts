export interface Shaders {
  create(options: {
    name: string;
    content: string;
    hints?: Record<string, GPUShaderModuleCompilationHint>;
  }): GPUShaderModule;
  read(item: string | GPUShaderModule): GPUShaderModule;
  remove(item: string | GPUShaderModule): void;
  map: Map<string, GPUShaderModule>;
}
