import type { TypeArray } from '../../types/typeArray.js';

export type VertexBufferArray = Uint32Array | Int32Array | Float32Array;
export interface CreateVertexBufferOptions {
  name: string;
  content?: VertexBufferArray;
  capacity?: number;
}

export type IndexBufferArray = Uint16Array | Uint32Array;
export interface CreateIndexBufferOptions {
  name: string;
  content?: IndexBufferArray;
  capacity?: number;
}

export type UniformBufferArray = TypeArray;
export interface CreateUniformBufferOptions {
  name: string;
  content?: TypeArray;
  capacity?: number;
}

export interface Buffers {
  uniform: {
    create(options: CreateUniformBufferOptions): GPUBuffer;
    write(item: string | GPUBuffer, content: UniformBufferArray): void;
  };
  vertex: {
    create(options: CreateVertexBufferOptions): GPUBuffer;
    write(item: string | GPUBuffer, content: VertexBufferArray): void;
  };
  index: {
    create(options: CreateIndexBufferOptions): GPUBuffer;
    write(item: string | GPUBuffer, content: IndexBufferArray): void;
  };
  remove(item: string | GPUBuffer): void;
  write(item: string | GPUBuffer, content: TypeArray): void;
  read(item: string | GPUBuffer): GPUBuffer;
  map: Map<string, GPUBuffer>;
}
