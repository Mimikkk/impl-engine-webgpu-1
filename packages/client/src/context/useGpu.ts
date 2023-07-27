import { devtools } from 'zustand/middleware';
import { create as createStore } from 'zustand';
import { createEngine, type Engine } from '@zd/engine';
import exampleShader from '@assets/resources/shaders/example.wgsl?raw';
import { Status } from '@typings/status.js';

export const createShader = (engine: GPUDevice) => {};

export interface ContextStore {
  engine: Awaited<ReturnType<typeof createEngine>>;
  state: {};
  render: {
    triangle(): void;
  };
  actions: {
    initialize: (canvas: HTMLCanvasElement) => Promise<void>;
  };
  status: Status;
}

interface CreateVertexBufferOptions {
  name?: string;
  capacity?: number;
}

export const createVertexBuffer = (
  engine: Engine,
  { name = 'vertex-buffer', capacity = 0 }: CreateVertexBufferOptions,
) => {
  const vertices = new Float32Array([
    0.0, 0.6, 0, 1, 1, 0, 0, 1, -0.5, -0.6, 0, 1, 0, 1, 0, 1, 0.5, -0.6, 0, 1, 0, 0, 1, 1,
  ]);

  const vertexBuffer = engine.api.createBuffer({
    label: 'vertex-buffer',
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  engine.api.queue.writeBuffer(vertexBuffer, 0, vertices, 0, vertices.length);

  return vertexBuffer;
};

const vertices = new Float32Array([
  0.0, 0.6, 0, 1, 1, 0, 0, 1, -0.5, -0.6, 0, 1, 0, 1, 0, 1, 0.5, -0.6, 0, 1, 0, 0, 1, 1,
]);

export const useGpu = createStore<ContextStore>()(
  devtools(
    (set, get) => ({
      engine: null as never,
      status: Status.Idle,
      state: {},
      render: {
        triangle: () => {
          const { engine } = get();
          const { api, context, buffers, shaders } = engine.get();

          const module = shaders.create({ name: 'example', content: exampleShader });

          const vbo = buffers.vertex.create({ name: 'triangle', content: vertices });

          const renderPipeline = api.createRenderPipeline({
            vertex: {
              module,
              entryPoint: 'vertex_main',
              buffers: [
                {
                  attributes: [
                    {
                      // position
                      shaderLocation: 0,
                      offset: 0,
                      format: 'float32x4',
                    },
                    {
                      // color
                      shaderLocation: 1,
                      offset: 16,
                      format: 'float32x4',
                    },
                  ],
                  arrayStride: 32,
                  stepMode: 'vertex',
                },
              ],
            },
            fragment: {
              module,
              entryPoint: 'fragment_main',
              targets: [
                {
                  format: navigator.gpu.getPreferredCanvasFormat(),
                },
              ],
            },
            primitive: {
              topology: 'triangle-list',
            },
            layout: 'auto',
          });

          const commandEncoder = api.createCommandEncoder();
          const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
              {
                clearValue: { r: 0.0, g: 0.5, b: 1.0, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
                view: context.getCurrentTexture().createView(),
              },
            ],
          });

          passEncoder.setPipeline(renderPipeline);
          passEncoder.setVertexBuffer(0, vbo);
          passEncoder.draw(3);

          passEncoder.end();

          api.queue.submit([commandEncoder.finish()]);
        },
      },
      actions: {
        initialize: async canvas => {
          set({ status: Status.Pending });

          try {
            const engine = await createEngine(canvas);
            set({ status: Status.Success, engine });
          } catch (e) {
            set({ status: Status.Error });
            console.error(e);
          }
        },
      },
    }),
    {
      store: 'context',
      name: 'context',
      serialize: true,
      enabled: true,
    },
  ),
);
