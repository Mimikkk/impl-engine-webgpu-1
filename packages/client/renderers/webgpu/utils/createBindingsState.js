import { GPUBufferBindingType, GPUTextureAspect, GPUTextureViewDimension } from './constants.js';

export const createBindingsState = backend => {
	const self = {
		layout: bindingsCpu =>
			backend.device.createBindGroupLayout({
				entries: bindingsCpu.map((bindingCpu, slot) => {
					const bindingGpu = { binding: slot, visibility: bindingCpu.visibility };

					if (bindingCpu.isUniformBuffer || bindingCpu.isStorageBuffer) {
						const buffer = /*GPUBufferBindingLayout*/ {};

						if (bindingCpu.isStorageBuffer) buffer.type = GPUBufferBindingType.Storage;

						bindingGpu.buffer = buffer;
						return bindingGpu;
					}

					if (bindingCpu.isSampler) {
						const sampler = /* GPUSamplerBindingLayout */ {};

						if (bindingCpu.texture.isDepthTexture && bindingCpu.texture.compareFunction) sampler.type = 'comparison';

						bindingGpu.sampler = sampler;
						return bindingGpu;
					}

					if (bindingCpu.isSampledTexture && bindingCpu.texture.isVideoTexture) {
						bindingGpu.externalTexture = /* GPUExternalTextureBindingLayout */ {};
						return bindingGpu;
					}

					if (bindingCpu.isSampledTexture) {
						const texture = /* GPUTextureBindingLayout */ {};

						if (bindingCpu.texture.isDepthTexture) texture.sampleType = 'depth';
						if (bindingCpu.isSampledCubeTexture) texture.viewDimension = GPUTextureViewDimension.Cube;

						bindingGpu.texture = texture;
						return bindingGpu;
					}

					console.error(`WebGPUBindingUtils: Unsupported binding "${bindingCpu}".`);
					return bindingGpu;
				}),
			}),
		create: bindingsCpu => {
			const bindingsGpu = backend.get(bindingsCpu);
			bindingsGpu.layout = self.layout(bindingsCpu);
			bindingsGpu.group = self.group(bindingsCpu, bindingsGpu.layout);
			bindingsGpu.bindings = bindingsCpu;
		},
		update: bindingCpu => backend.device.queue.writeBuffer(backend.get(bindingCpu).buffer, 0, bindingCpu.buffer, 0),
		group: (bindingsCpu, layoutGpu) =>
			backend.device.createBindGroup({
				layout: layoutGpu,
				entries: bindingsCpu.map((bindingCpu, slot) => {
					if (bindingCpu.isUniformBuffer) {
						const bindingGpu = backend.get(bindingCpu);

						if (!bindingGpu.buffer)
							bindingGpu.buffer = backend.device.createBuffer({
								label: 'bindingBuffer',
								size: bindingCpu.byteLength,
								usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
							});

						return { binding: slot, resource: { buffer: bindingGpu.buffer } };
					}

					if (bindingCpu.isStorageBuffer) {
						const bindingGpu = backend.get(bindingCpu);

						if (!bindingGpu.buffer) bindingGpu.buffer = backend.get(bindingCpu.attribute).buffer;

						return { binding: slot, resource: { buffer: bindingGpu.buffer } };
					}

					if (bindingCpu.isSampler) return { binding: slot, resource: backend.get(bindingCpu.texture).sampler };

					if (bindingCpu.isSampledTexture) {
						const textureGpu = backend.get(bindingCpu.texture);

						const dimensionViewGpu = bindingCpu.isSampledCubeTexture
							? GPUTextureViewDimension.Cube
							: GPUTextureViewDimension.TwoD;

						const resourceGpu = textureGpu.externalTexture
							? backend.device.importExternalTexture({ source: textureGpu.externalTexture })
							: textureGpu.texture.createView({ aspect: GPUTextureAspect.All, dimension: dimensionViewGpu });

						return { binding: slot, resource: resourceGpu };
					}

					console.error(`WebGPUBindingUtils: Unsupported binding "${bindingCpu}".`);
					return bindingGpu;
				}),
			}),
	};

	return self;
};
