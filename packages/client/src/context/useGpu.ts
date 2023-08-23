import { devtools } from 'zustand/middleware';
import { create as createStore } from 'zustand';
import { createEngine, createUpdateLoop, type UpdateLoop } from '@zd/engine';
import exampleShader from '@assets/resources/shaders/example.wgsl?raw';
import { Status } from '@typings/status.js';
import { ExampleName } from '../renderers/examples/examples.js';

export interface ContextStore {
  example: ExampleName;
  engine: Awaited<ReturnType<typeof createEngine>>;
  loop: UpdateLoop;
  state: {
    commands: GPUCommandBuffer[];
  };
  render: {
    triangle(): void;
  };
  actions: {
    changeExample: (example: ExampleName) => void;
    initialize: (canvas: HTMLCanvasElement) => Promise<void>;
  };
  status: Status;
}

const vertices = new Float32Array([
  0.0, 0.6, 0, 1, 1, 0, 0, 1, -0.5, -0.6, 0, 1, 0, 1, 0, 1, 0.5, -0.6, 0, 1, 0, 0, 1, 1,
]);
let memo: any = undefined;
export const useGpu = createStore<ContextStore>()(
  devtools(
    (set, get) => ({
      example: (window.localStorage.getItem('selected-example') ?? 'Backdrop') as ExampleName,
      engine: null as never,
      loop: null as never,
      status: Status.Idle,
      state: {
        commands: [],
      },
      render: {
        triangle: () => {
          const { engine } = get();
          const { api, context, buffers, shaders } = engine.get();

          if (!memo) {
            const module = shaders.create({ name: 'example', content: exampleShader });
            const vbo = buffers.vertex.create({ name: 'triangle', content: vertices });
            const renderer = api.createRenderPipeline({
              label: 'triangle',
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
            const color = { r: 0.0, g: 0.5, b: 1.0, a: 1.0 };
            memo = { vbo, renderer, color };
          }

          const commandEncoder = api.createCommandEncoder();
          const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
              {
                clearValue: memo.color,
                loadOp: 'clear',
                storeOp: 'store',
                view: context.getCurrentTexture().createView(),
              },
            ],
          });

          memo.color.r = (Math.sin(Date.now() / 1000) + 1) / 2;
          memo.color.g = (Math.cos(Date.now() / 1000) + 1) / 2;
          memo.color.b = (Math.sin(Date.now() / 1000) + 1) / 2;

          passEncoder.setPipeline(memo.renderer);
          passEncoder.setVertexBuffer(0, memo.vbo);
          passEncoder.draw(3);
          passEncoder.end();

          const commandBuffer = commandEncoder.finish();

          get().state.commands.push(commandBuffer);
        },
      },
      actions: {
        changeExample: example => {
          window.localStorage.setItem('selected-example', example);
          set({ example });
        },
        initialize: async canvas => {
          set({ status: Status.Pending });

          try {
            const engine = await createEngine(canvas);
            const loop = createUpdateLoop({
              rendersPerSecond: 60,
              updatesPerSecond: 20,
              update: () => {},
              blend: () => {},
              render: () => {
                get().render.triangle();
                engine.get().api.queue.submit(get().state.commands);
                get().state.commands.length = 0;
              },
              immediate: false,
            });

            set({ status: Status.Success, engine, loop });
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
