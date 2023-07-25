import { devtools } from 'zustand/middleware';
import { create as createStore } from 'zustand';
import { create as createEngine, type CreateReturn } from '@zd/engine';
import exampleShader from '@assets/resources/shaders/example.wgsl?raw';
import { Status } from '@typings/status.js';

export const createShader = (engine: GPUDevice) => {};

export interface ContextStore {
  engine: CreateReturn;
  state: {};
  render: {
    triangle(): void;
  };
  actions: {
    initialize: (canvas: HTMLCanvasElement) => Promise<void>;
  };
  status: Status;
}

export const useGpu = createStore<ContextStore>()(
  devtools(
    (set, get) => ({
      engine: null as never,
      status: Status.Idle,
      state: {},
      render: {
        triangle: () => {
          const { engine } = get();

          const shaderModule = (engine.api as GPUDevice).createShaderModule({
            label: 'shader-label',
            code: exampleShader,
            // /* Figure out whether to bother */
            hints: undefined,
            // /* Figure out whether to bother */
            sourceMap: undefined,
          });

          engine.context.configure({
            device: engine.api,
            format: navigator.gpu.getPreferredCanvasFormat(),
            alphaMode: 'premultiplied',
          });

          const vertices = new Float32Array([
            0.0, 0.6, 0, 1, 1, 0, 0, 1, -0.5, -0.6, 0, 1, 0, 1, 0, 1, 0.5, -0.6, 0, 1, 0, 0, 1, 1,
          ]);

          const vertexBuffer = engine.api.createBuffer({
            size: vertices.byteLength, // make it big enough to store vertices in
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
          });

          engine.api.queue.writeBuffer(vertexBuffer, 0, vertices, 0, vertices.length);

          const renderPipeline = engine.api.createRenderPipeline({
            vertex: {
              module: shaderModule,
              entryPoint: 'vertex_main',
              buffers: [
                {
                  attributes: [
                    {
                      shaderLocation: 0, // position
                      offset: 0,
                      format: 'float32x4',
                    },
                    {
                      shaderLocation: 1, // color
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
              module: shaderModule,
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

          const commandEncoder = engine.api.createCommandEncoder();

          const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
              {
                clearValue: { r: 0.0, g: 0.5, b: 1.0, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
                view: engine.context.getCurrentTexture().createView(),
              },
            ],
          });

          passEncoder.setPipeline(renderPipeline);
          passEncoder.setVertexBuffer(0, vertexBuffer);
          passEncoder.draw(3);

          passEncoder.end();

          engine.api.queue.submit([commandEncoder.finish()]);
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
            throw e;
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
