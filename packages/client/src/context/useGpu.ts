import { devtools } from 'zustand/middleware';
import { create as createStore } from 'zustand';
import { create as createEngine } from '@zd/engine';

export interface ContextStore {
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
  engine: unknown;
  state: {};
  actions: {
    initialize: (canvas: HTMLCanvasElement) => Promise<void>;
  };
}

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
            code: shaders,
            // /* Figure out whether to bother */
            hints: undefined,
            // /* Figure out whether to bother */
            sourceMap: undefined,
          });

          const x = engine.context.configure({
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
          const vertexBuffers = [
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
          ];

          const pipelineDescriptor = {
            vertex: {
              module: shaderModule,
              entryPoint: 'vertex_main',
              buffers: vertexBuffers,
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
          };

          const renderPipeline = engine.api.createRenderPipeline(pipelineDescriptor);

          const commandEncoder = engine.api.createCommandEncoder();

          const clearColor = { r: 0.0, g: 0.5, b: 1.0, a: 1.0 };

          const renderPassDescriptor = {
            colorAttachments: [
              {
                clearValue: clearColor,
                loadOp: 'clear',
                storeOp: 'store',
                view: engine.context.getCurrentTexture().createView(),
              },
            ],
          };

          const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

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

const shaders = `
struct VertexOut {
  @builtin(position) position : vec4f,
  @location(0) color : vec4f
}

@vertex
fn vertex_main(
  @location(0) position: vec4f,
  @location(1) color: vec4f
) -> VertexOut {
  var output : VertexOut;
  output.position = position;
  output.color = color;
  return output;
}

@fragment
fn fragment_main(fragment: VertexOut) -> @location(0) vec4f {
  return fragment.color;
}
`;
