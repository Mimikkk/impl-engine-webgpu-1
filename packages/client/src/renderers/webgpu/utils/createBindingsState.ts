import { GPUBufferBindingType, GPUTextureAspect, GPUTextureViewDimension } from './constants.js';
import { Organizer } from '../createOrganizer.js';

export const createBindingsState = (backend: Organizer) => {
  const self = {
    layout: (bindingsCpu: any) =>
      backend.device!.createBindGroupLayout({
        entries: bindingsCpu.map((bindingCpu: any, slot: any) => {
          const bindingGpu = { binding: slot, visibility: bindingCpu.visibility } as any;

          if (bindingCpu.isUniformBuffer || bindingCpu.isStorageBuffer) {
            const buffer = /*GPUBufferBindingLayout*/ {} as any;

            if (bindingCpu.isStorageBuffer) buffer.type = GPUBufferBindingType.Storage;

            bindingGpu.buffer = buffer;
            return bindingGpu;
          }

          if (bindingCpu.isSampler) {
            const sampler = /* GPUSamplerBindingLayout */ {} as any;

            if (bindingCpu.texture.isDepthTexture && bindingCpu.texture.compareFunction) sampler.type = 'comparison';

            bindingGpu.sampler = sampler;
            return bindingGpu;
          }

          if (bindingCpu.isSampledTexture && bindingCpu.texture.isVideoTexture) {
            bindingGpu.externalTexture = /* GPUExternalTextureBindingLayout */ {};
            return bindingGpu;
          }

          if (bindingCpu.isSampledTexture) {
            const texture = /* GPUTextureBindingLayout */ {} as any;

            if (bindingCpu.texture.isDepthTexture) texture.sampleType = 'depth';
            if (bindingCpu.isSampledCubeTexture) texture.viewDimension = GPUTextureViewDimension.Cube;

            bindingGpu.texture = texture;
            return bindingGpu;
          }

          console.error(`WebGPUBindingUtils: Unsupported binding "${bindingCpu}".`);
          return bindingGpu;
        }),
      }),
    create: (bindingsCpu: any) => {
      const bindingsGpu = backend.get(bindingsCpu) as any;
      bindingsGpu.layout = self.layout(bindingsCpu);
      bindingsGpu.group = self.group(bindingsCpu, bindingsGpu.layout);
      bindingsGpu.bindings = bindingsCpu;
    },
    update: (bindingCpu: any) =>
      backend.device!.queue.writeBuffer((backend.get(bindingCpu) as any).buffer, 0, bindingCpu.buffer, 0),
    group: (bindingsCpu: any, layoutGpu: any) =>
      backend.device!.createBindGroup({
        layout: layoutGpu,
        entries: bindingsCpu.map((bindingCpu: any, slot: any) => {
          if (bindingCpu.isUniformBuffer) {
            const bindingGpu = backend.get(bindingCpu) as any;

            if (!bindingGpu.buffer)
              bindingGpu.buffer = backend.device!.createBuffer({
                label: 'bindingBuffer',
                size: bindingCpu.byteLength,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
              });

            return { binding: slot, resource: { buffer: bindingGpu.buffer } };
          }

          if (bindingCpu.isStorageBuffer) {
            const bindingGpu = backend.get(bindingCpu) as any;

            if (!bindingGpu.buffer) bindingGpu.buffer = (backend.get(bindingCpu.attribute) as any).buffer;

            return { binding: slot, resource: { buffer: bindingGpu.buffer } };
          }

          if (bindingCpu.isSampler)
            return { binding: slot, resource: (backend.get(bindingCpu.texture) as any).sampler };

          if (bindingCpu.isSampledTexture) {
            const textureGpu = backend.get(bindingCpu.texture) as any;

            const dimensionViewGpu = bindingCpu.isSampledCubeTexture
              ? GPUTextureViewDimension.Cube
              : GPUTextureViewDimension.TwoD;

            const resourceGpu = textureGpu.externalTexture
              ? backend.device!.importExternalTexture({ source: textureGpu.externalTexture })
              : textureGpu.texture.createView({ aspect: GPUTextureAspect.All, dimension: dimensionViewGpu });

            return { binding: slot, resource: resourceGpu };
          }

          console.error(`WebGPUBindingUtils: Unsupported binding "${bindingCpu}".`);
          return;
        }),
      }),
  };

  return self;
};
