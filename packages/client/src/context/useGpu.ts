import { devtools } from 'zustand/middleware';
import { create as createStore } from 'zustand';
import { create as createEngine } from '@zd/engine';
import exampleShader from '@assets/resources/shaders/example.wgsl?raw';

export interface ContextStore {
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
  engine: unknown;
  state: {};
  actions: {
    initialize: (canvas: HTMLCanvasElement) => Promise<void>;
  };
}

export const createShader = (engine: GPUDevice) => {};

export const useGpu = createStore<ContextStore>()(
  devtools(
    (set, get) => ({
      canvas: null as never,
      engine: null as never,
      context: null as never,
      state: {},
      actions: {
        initialize: async canvas => {
          const engine = await createEngine(canvas);

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

          set({ engine, canvas, context: engine.context });
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
