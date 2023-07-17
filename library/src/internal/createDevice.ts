export interface LimitOptions extends Record<string, number | undefined> {
  /**
   * The maximum width or height of a 1D texture.
   *
   * @default 8192 pixels
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxtexturedimension1d
   * */
  maxTextureDimension1D?: number,
  /**
   * The maximum width or height of a 2D texture.
   *
   * @default 8192 pixels
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxtexturedimension2d
   * */
  maxTextureDimension2D?: number,
  /**
   * The maximum width or height of a 3D texture.
   *
   * @default 2048 pixels
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxtexturedimension3d
   * */
  maxTextureDimension3D?: number,
  /**
   * The maximum allowed value for the size.depthOrArrayLayers of a 2d texture".
   *
   * @default 256
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxtexturearraylayers
   */
  maxTextureArrayLayers?: number,
  /**
   * The maximum number of GPUBindGroupLayouts allowed in bindGroupLayouts when creating a GPUPipelineLayout.
   *
   * @default 4
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxbindgroups
   */
  maxBindGroups?: number,
  /**
   * The maximum number of bindings allowed in a GPUBindGroup.
   *
   * @default 640
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxbindingsperbindgroup
   */
  maxBindingsPerBindGroup?: number,
  /**
   * The maximum number of dynamic uniform buffers allowed in a GPUPipelineLayout.
   *
   * @default 8
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxdynamicuniformbuffersperpipelinelayout
   */
  maxDynamicUniformBuffersPerPipelineLayout?: number,
  /**
   * The maximum number of dynamic storage buffers allowed in a GPUPipelineLayout.
   *
   * @default 4
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxdynamicstoragebuffersperpipelinelayout
   */
  maxDynamicStorageBuffersPerPipelineLayout?: number,
  /**
   * The maximum number of sampled textures allowed in a shader stage.
   *
   * @default 16
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxsampledtexturespershaderstage
   */
  maxSampledTexturesPerShaderStage?: number,
  /**
   * The maximum number of samplers allowed in a shader stage.
   *
   * @default 16
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxsamplerspershaderstage
   */
  maxSamplersPerShaderStage?: number,
  /**
   * The maximum number of storage buffers allowed in a shader stage.
   *
   * @default 8
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxstoragebufferspershaderstage
   */
  maxStorageBuffersPerShaderStage?: number,
  /**
   * The maximum number of storage textures allowed in a shader stage.
   *
   * @default 4
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxstoragetexturespershaderstage
   */
  maxStorageTexturesPerShaderStage?: number,
  /**
   * The maximum number of uniform buffers allowed in a shader stage.
   *
   * @default 12
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxuniformbufferspershaderstage
   */
  maxUniformBuffersPerShaderStage?: number,
  /**
   * The maximum size in bytes of a uniform buffer binding in bytes.
   *
   * @default 65536 (64 KiB)
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxuniformbufferbindingsize
   */
  maxUniformBufferBindingSize?: number,
  /**
   * The maximum size in bytes of a storage buffer binding in bytes.
   *
   * @default 134217728 (128 MiB)
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxstoragebufferbindingsize
   */
  maxStorageBufferBindingSize?: number,
  /**
   * The minimum uniform buffer offset alignment in bytes.
   *
   * @default 256 bytes
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxvertexbuffers
   */
  minUniformBufferOffsetAlignment?: number,
  /**
   * The minimum storage buffer offset alignment in bytes.
   *
   * @default 256 bytes
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxvertexbuffers
   */
  minStorageBufferOffsetAlignment?: number,
  /**
   * The maximum number of vertex buffers allowed in a vertex state.
   *
   * @default 8
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxvertexbuffers
   */
  maxVertexBuffers?: number,
  /**
   * The maximum bytes per buffer instance.
   *
   * @default 268435456 (256 MiB)
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxbuffersize
   */
  maxBufferSize?: number,
  /**
   * The maximum number of vertex attributes allowed in a vertex state.
   *
   * @default 16
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxvertexattributes
   */
  maxVertexAttributes?: number,
  /**
   * The maximum allowed arrayStride when creating a GPURenderPipeline.
   *
   * @default 2048 bytes (2 KiB)
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxvertexbuffers
   */
  maxVertexBufferArrayStride?: number,
  /**
   * The maximum allowed number of components of input or output variables for inter-stage communication (like vertex outputs or fragment inputs).
   *
   * @default 60
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxinterstageshadercomponents
   */
  maxInterStageShaderComponents?: number,
  /**
   * The maximum allowed number of variables for inter-stage communication (like vertex outputs or fragment inputs).
   *
   * @default 16
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxinterstageshadervariables
   */
  maxInterStageShaderVariables?: number,
  /**
   * The maximum allowed number of color attachments in GPURenderPipelineDescriptor.fragment.targets, GPURenderPassDescriptor.colorAttachments, and GPURenderPassLayout.colorFormats.
   *
   * @default 8
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxcolorattachments
   */
  maxColorAttachments?: number,
  /**
   * The maximum number of bytes necessary to hold one sample (pixel or subpixel) of render pipeline output data, across all color attachments.
   *
   * @default 32
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxcolorattachmentbytespersample
   */
  maxColorAttachmentBytesPerSample?: number,
  /**
   * The maximum number of bytes of workgroup storage used for a compute stage GPUShaderModule entry-point.
   *
   * @default 16384 (16 KiB)
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxcomputeworkgroupstoragesize
   */
  maxComputeWorkgroupStorageSize?: number,
  /**
   * The maximum value of the product of the workgroup_size dimensions for a compute stage GPUShaderModule entry-point.
   *
   * @default 256
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxcomputeinvocationsperworkgroup
   */
  maxComputeInvocationsPerWorkgroup?: number,
  /**
   * The maximum value of the workgroup_size X dimension for a compute stage GPUShaderModule entry-point.
   *
   * @default 256
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxcomputeworkgroupsizex
   */
  maxComputeWorkgroupSizeX?: number,
  /**
   * The maximum value of the workgroup_size Y dimension for a compute stage GPUShaderModule entry-point.
   *
   * @default 256
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxcomputeworkgroupsizey
   */
  maxComputeWorkgroupSizeY?: number,
  /**
   * The maximum value of the workgroup_size Z dimension for a compute stage GPUShaderModule entry-point.
   *
   * @default 64
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxcomputeworkgroupsizez
   */
  maxComputeWorkgroupSizeZ?: number,
  /**
   * The maximum value for the arguments of dispatchWorkgroups(workgroupCountX, workgroupCountY, workgroupCountZ).
   *
   * @default 65535
   * @see https://www.w3.org/TR/webgpu/#dom-supported-limits-maxcomputeworkgroupsperdispatch
   */
  maxComputeWorkgroupsPerDimension?: number,
}
export interface DeviceOptions extends GPUDeviceDescriptor {
  requiredLimits?: Record<string, number> & LimitOptions;
}

export const createDevice = async (adapter: GPUAdapter, options: DeviceOptions = {}): Promise<GPUDevice> => {
  options.label ||= 'WebGPU Device';

  const device = await adapter.requestDevice(options);
  if (!device) throw Error('Could not request WebGPU device.');

  return device;
}
