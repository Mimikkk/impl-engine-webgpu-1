import { Float16BufferAttribute } from 'three';
import { GPUInputStepMode } from './constants.js';

const typedArraysToVertexFormatPrefix = new Map([
	[Int8Array, ['sint8', 'snorm8']],
	[Uint8Array, ['uint8', 'unorm8']],
	[Int16Array, ['sint16', 'snorm16']],
	[Uint16Array, ['uint16', 'unorm16']],
	[Int32Array, ['sint32', 'snorm32']],
	[Uint32Array, ['uint32', 'unorm32']],
	[Float32Array, ['float32']],
]);
const typedAttributeToVertexFormatPrefix = new Map([[Float16BufferAttribute, ['float16']]]);
const typeArraysToVertexFormatPrefixForItemSize = new Map([
	[Int32Array, 'sint32'],
	[Uint32Array, 'uint32'],
	[Float32Array, 'float32'],
]);

export const createAttributesState = backend => {
	const createShaderVertexBuffers = renderObject => {
		const attributes = renderObject.getAttributes();
		const buffers = new Map();

		for (let slot = 0; slot < attributes.length; slot++) {
			const geometryAttribute = attributes[slot];
			const bytesPerElement = geometryAttribute.array.BYTES_PER_ELEMENT;
			const bufferAttribute = findBuffer(geometryAttribute);

			let layout = buffers.get(bufferAttribute);
			if (!layout) {
				const createLayout = (stride, isInstanced) => ({
					arrayStride: stride * bytesPerElement,
					stepMode: isInstanced ? GPUInputStepMode.Instance : GPUInputStepMode.Vertex,
					attributes: [],
				});

				layout = geometryAttribute.isInterleavedBufferAttribute
					? createLayout(geometryAttribute.data.stride, geometryAttribute.isInstancedBufferAttribute)
					: createLayout(geometryAttribute.itemSize, geometryAttribute.isInstancedBufferAttribute);

				buffers.set(bufferAttribute, layout);
			}

			layout.attributes.push({
				shaderLocation: slot,
				offset: geometryAttribute.isInterleavedBufferAttribute ? geometryAttribute.offset * bytesPerElement : 0,
				format: findVertexFormat(geometryAttribute),
			});
		}

		return Array.from(buffers.values());
	};
	const findVertexFormat = geometryAttribute => {
		const { itemSize, normalized, constructor: AttributeType } = geometryAttribute;
		const { constructor: ArrayType } = geometryAttribute.array;

		if (itemSize === 1) {
			return typeArraysToVertexFormatPrefixForItemSize.get(ArrayType);
		}

		const prefix = (typedAttributeToVertexFormatPrefix.get(AttributeType) ||
			typedArraysToVertexFormatPrefix.get(ArrayType))[normalized ? 1 : 0];

		if (prefix) {
			const bytesPerUnit = ArrayType.BYTES_PER_ELEMENT * itemSize;
			const paddedBytesPerUnit = Math.floor((bytesPerUnit + 3) / 4) * 4;
			const paddedItemSize = paddedBytesPerUnit / ArrayType.BYTES_PER_ELEMENT;

			if (paddedItemSize % 1) throw Error('THREE.WebGPUAttributeUtils: Bad vertex format item size.');

			return `${prefix}x${paddedItemSize}`;
		}

		console.error('THREE.WebGPUAttributeUtils: Vertex format not supported yet.');
	};
	const findBuffer = attribute => (attribute.isInterleavedBufferAttribute ? attribute.data : attribute);
	const create = (attribute, usage) => {
		const bufferCpu = findBuffer(attribute);
		const bufferGpu = backend.get(bufferCpu);
		if (bufferGpu.buffer) return;

		bufferGpu.buffer = backend.device.createBuffer({
			label: bufferCpu.array.name,
			size: bufferCpu.array.byteLength + ((4 - (bufferCpu.array.byteLength % 4)) % 4),
			usage: usage,
			mappedAtCreation: true,
		});
		new bufferCpu.array.constructor(bufferGpu.buffer.getMappedRange()).set(bufferCpu.array);
		bufferGpu.buffer.unmap();
	};
	const update = attribute => {
		const bufferCpu = findBuffer(attribute);

		const { buffer: bufferGpu } = backend.get(bufferCpu);
		const { array, updateRange } = bufferCpu;

		if (updateRange.count === -1) {
			backend.device.queue.writeBuffer(bufferGpu, 0, array, 0);
			return;
		}

		backend.device.queue.writeBuffer(
			bufferGpu,
			0,
			array,
			updateRange.offset * array.BYTES_PER_ELEMENT,
			updateRange.count * array.BYTES_PER_ELEMENT,
		);

		// reset range
		updateRange.count = -1;
	};
	const destroy = attribute => {
		backend.get(findBuffer(attribute)).buffer.destroy();
		backend.delete(attribute);
	};
	const readBuffer = async attribute => {
		const bufferCpu = backend.get(findBuffer(attribute));

		const bufferGpu = bufferCpu.buffer;
		const { size } = bufferGpu;

		let shouldUnmap = true;
		if (!bufferCpu.readBuffer) {
			shouldUnmap = false;
			bufferCpu.readBuffer = backend.device.createBuffer({
				label: attribute.name,
				size,
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
			});
		}

		const cmdEncoder = backend.device.createCommandEncoder({});
		cmdEncoder.copyBufferToBuffer(bufferGpu, 0, bufferCpu.readBuffer, 0, size);

		if (shouldUnmap) bufferCpu.readBuffer.unmap();

		backend.device.queue.submit([cmdEncoder.finish()]);

		await bufferCpu.readBuffer.mapAsync(GPUMapMode.READ);
		return bufferCpu.readBuffer.getMappedRange();
	};

	return { create, update, createShaderVertexBuffers, destroy, readBuffer };
};
