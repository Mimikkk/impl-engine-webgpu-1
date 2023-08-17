import {
	GPUTextureViewDimension,
	GPUIndexFormat,
	GPUFilterMode,
	GPUPrimitiveTopology,
	GPULoadOp,
	GPUStoreOp,
} from './constants.js';

const source = `
struct VertexOutput {
	@location(0) texture : vec2<f32>,
	@builtin(position) position: vec4<f32>
};

const positions = array<vec4<f32>, 4>(
	vec4<f32>(-1.0,  1.0, 0.0, 1.0),
	vec4<f32>( 1.0,  1.0, 0.0, 1.0),
	vec4<f32>(-1.0, -1.0, 0.0, 1.0),
	vec4<f32>( 1.0, -1.0, 0.0, 1.0)
);

const textures = array<vec2<f32>, 4>(
	vec2<f32>(0.0, 0.0),
	vec2<f32>(1.0, 0.0),
	vec2<f32>(0.0, 1.0),
	vec2<f32>(1.0, 1.0)
);

@vertex
fn vertex_main( @builtin(vertex_index) index: u32) -> VertexOutput {
	return VertexOutput(textures[index], positions[index]);
}

@group(0) @binding(0)
var image_sampler: sampler;
@group(0) @binding(1)
var image: texture_2d<f32>;

@fragment
fn fragment_main(@location(0) texture: vec2<f32>) -> @location(0) vec4<f32> {
	return textureSample(image, image_sampler, texture);
}
`;
export const createMipMapState = ({ device }) => {
	const sampler = device.createSampler({ minFilter: GPUFilterMode.Linear });

	const pipelines = {};
	const module = device.createShaderModule({ label: 'mipmap-generation', code: source });

	const self = {
		generate: (textureGpu, textureGpuDescriptor, baseArrayLayer = 0) => {
			const pipeline = self.readPipeline(textureGpuDescriptor.format);

			const commands = device.createCommandEncoder({});
			const layout = pipeline.getBindGroupLayout(0);

			let source = textureGpu.createView({
				baseMipLevel: 0,
				mipLevelCount: 1,
				dimension: GPUTextureViewDimension.TwoD,
				baseArrayLayer,
			});

			for (let i = 1; i < textureGpuDescriptor.mipLevelCount; i++) {
				const destination = textureGpu.createView({
					baseMipLevel: i,
					mipLevelCount: 1,
					dimension: GPUTextureViewDimension.TwoD,
					baseArrayLayer,
				});

				const pass = commands.beginRenderPass({
					colorAttachments: [
						{
							view: destination,
							loadOp: GPULoadOp.Clear,
							storeOp: GPUStoreOp.Store,
							clearValue: [0, 0, 0, 0],
						},
					],
				});

				const group = device.createBindGroup({
					layout: layout,
					entries: [
						{ binding: 0, resource: sampler },
						{ binding: 1, resource: source },
					],
				});

				pass.setPipeline(pipeline);
				pass.setBindGroup(0, group);
				pass.draw(4, 1, 0, 0);
				pass.end();

				source = destination;
			}

			device.queue.submit([commands.finish()]);
		},
		readPipeline: format => {
			if (pipelines[format]) return pipelines[format];

			pipelines[format] = device.createRenderPipeline({
				vertex: { module: module, entryPoint: 'vertex_main' },
				fragment: { module: module, entryPoint: 'fragment_main', targets: [{ format }] },
				primitive: { topology: GPUPrimitiveTopology.TriangleStrip, stripIndexFormat: GPUIndexFormat.Uint32 },
				layout: 'auto',
			});

			return pipelines[format];
		},
	};
	return self;
};
