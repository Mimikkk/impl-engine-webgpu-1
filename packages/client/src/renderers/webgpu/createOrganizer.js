import {
  GPUFeatureName,
  GPUIndexFormat,
  GPULoadOp,
  GPUStoreOp,
  GPUTextureFormat,
  GPUTextureViewDimension,
} from './utils/constants.js';

import WebGPUNodeBuilder from './nodes/WebGPUNodeBuilder.js';

import {
  DepthFormat,
  DepthStencilFormat,
  DepthTexture,
  UnsignedInt248Type,
  UnsignedIntType,
  Vector2,
  Vector4,
  WebGPUCoordinateSystem,
} from 'three';

import { createUtilitiesState } from './utils/createUtilitiesState.js';
import { createAttributesState } from './utils/createAttributesState.js';
import { createBindingsState } from './utils/createBindingsState.js';
import { createPipelinesState } from './utils/createPipelinesState.js';
import { createTexturesState } from './utils/createTexturesState.js';

let vector2 = new Vector2();
let vector4 = new Vector4();

export class Organizer {
  constructor(options = {}) {
    const { antialias = true, requiredLimits = {}, sampleCount = antialias ? 4 : 1, ...parameters } = options;
    this.parameters = { antialias, sampleCount, requiredLimits, ...parameters };
    /** @type {WeakMap<object, object>} */
    this.resources = new WeakMap();
    /** @type {Renderer} */
    this.renderer = null;
    /** @type {HTMLCanvasElement} */
    this.canvas = null;
    this.adapter = null;
    this.device = null;
    /** @type {CanvasRenderingContext2D} */
    this.context = null;
    this.colorBuffer = null;

    this.defaultDepthTexture = new DepthTexture();
    this.defaultDepthTexture.name = 'depthBuffer';

    this.utilites = createUtilitiesState(this);
    this.attributes = createAttributesState(this);
    this.bindings = createBindingsState(this);
    this.pipelines = createPipelinesState(this);
    this.textures = createTexturesState(this);
  }

  getInstanceCount = ({ object, geometry }) =>
    geometry.isInstancedBufferGeometry ? geometry.instanceCount : object.isInstancedMesh ? object.count : 1;

  getDrawingBufferSize = () => this.renderer.getDrawingBufferSize(vector2);

  getScissor = () => this.renderer.getScissor(vector4);

  getDomElement() {
    if (!this.canvas) this.canvas = this.parameters.canvas ?? this.createCanvasElement();
    return this.canvas;
  }

  createCanvasElement() {
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    return canvas;
  }

  get(object) {
    let resource = this.resources.get(object);
    if (!resource) {
      resource = {};
      this.resources.set(object, resource);
    }
    return resource;
  }

  delete = object => this.resources.delete(object);

  async init(renderer) {
    this.renderer = renderer;

    this.adapter = await navigator.gpu.requestAdapter({
      powerPreference: this.parameters.powerPreference,
    });
    if (!this.adapter) throw Error('WebGPUBackend: Unable to create WebGPU adapter.');

    this.device = await this.adapter.requestDevice({
      requiredFeatures: Object.values(GPUFeatureName).filter(name => this.adapter.features.has(name)),
      requiredLimits: this.parameters.requiredLimits,
    });

    this.context = this.parameters.context ?? renderer.domElement.getContext('webgpu');

    this.updateSize();
  }

  get coordinateSystem() {
    return WebGPUCoordinateSystem;
  }

  async getArrayBufferAsync(attribute) {
    return await this.attributes.readBuffer(attribute);
  }

  beginRender(context) {
    const contextGpu = this.get(context);

    const device = this.device;

    const descriptor = {
      colorAttachments: [
        {
          view: null,
        },
      ],
      depthStencilAttachment: {
        view: null,
      },
    };

    const colorAttachment = descriptor.colorAttachments[0];
    const depthStencilAttachment = descriptor.depthStencilAttachment;

    const antialias = this.parameters.antialias;

    if (context.texture !== null) {
      const textureData = this.get(context.texture);
      const depthTextureData = this.get(context.depthTexture);

      const view = textureData.texture.createView({
        baseMipLevel: 0,
        mipLevelCount: 1,
        baseArrayLayer: context.activeCubeFace,
        dimension: GPUTextureViewDimension.TwoD,
      });

      if (textureData.msaaTexture !== undefined) {
        colorAttachment.view = textureData.msaaTexture.createView();
        colorAttachment.resolveTarget = view;
      } else {
        colorAttachment.view = view;
        colorAttachment.resolveTarget = undefined;
      }

      depthStencilAttachment.view = depthTextureData.texture.createView();

      if (context.stencil && context.depthTexture.format === DepthFormat) {
        context.stencil = false;
      }
    } else {
      if (antialias === true) {
        colorAttachment.view = this.colorBuffer.createView();
        colorAttachment.resolveTarget = this.context.getCurrentTexture().createView();
      } else {
        colorAttachment.view = this.context.getCurrentTexture().createView();
        colorAttachment.resolveTarget = undefined;
      }

      depthStencilAttachment.view = this.#getDepthBufferGPU(context).createView();
    }

    if (context.clearColor) {
      colorAttachment.clearValue = context.clearColorValue;
      colorAttachment.loadOp = GPULoadOp.Clear;
      colorAttachment.storeOp = GPUStoreOp.Store;
    } else {
      colorAttachment.loadOp = GPULoadOp.Load;
      colorAttachment.storeOp = GPUStoreOp.Store;
    }

    //

    if (context.depth) {
      if (context.clearDepth) {
        depthStencilAttachment.depthClearValue = context.clearDepthValue;
        depthStencilAttachment.depthLoadOp = GPULoadOp.Clear;
        depthStencilAttachment.depthStoreOp = GPUStoreOp.Store;
      } else {
        depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
        depthStencilAttachment.depthStoreOp = GPUStoreOp.Store;
      }
    }

    if (context.stencil) {
      if (context.clearStencil) {
        depthStencilAttachment.stencilClearValue = context.clearStencilValue;
        depthStencilAttachment.stencilLoadOp = GPULoadOp.Clear;
        depthStencilAttachment.stencilStoreOp = GPUStoreOp.Store;
      } else {
        depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;
        depthStencilAttachment.stencilStoreOp = GPUStoreOp.Store;
      }
    }

    //

    const encoder = device.createCommandEncoder({ label: 'renderContext_' + context.id });
    const currentPass = encoder.beginRenderPass(descriptor);

    //

    contextGpu.descriptor = descriptor;
    contextGpu.encoder = encoder;
    contextGpu.currentPass = currentPass;
    contextGpu.currentAttributesSet = {};

    //

    if (context.viewport) {
      this.updateViewport(context);
    }

    if (context.scissor) {
      const { x, y, width, height } = context.scissorValue;

      currentPass.setScissorRect(x, y, width, height);
    }
  }

  finishRender(renderContext) {
    const renderContextData = this.get(renderContext);

    renderContextData.currentPass.end();

    this.device.queue.submit([renderContextData.encoder.finish()]);

    //

    if (renderContext.texture !== null && renderContext.texture.generateMipmaps === true) {
      this.textures.mipmap(renderContext.texture);
    }
  }

  updateViewport(renderContext) {
    const { currentPass } = this.get(renderContext);
    const { x, y, width, height, minDepth, maxDepth } = renderContext.viewportValue;

    currentPass.setViewport(x, y, width, height, minDepth, maxDepth);
  }

  clear(renderContext, color, depth, stencil) {
    const device = this.device;
    const renderContextData = this.get(renderContext);

    const { descriptor } = renderContextData;

    depth = depth && renderContext.depth;
    stencil = stencil && renderContext.stencil;

    const colorAttachment = descriptor.colorAttachments[0];
    const depthStencilAttachment = descriptor.depthStencilAttachment;

    const antialias = this.parameters.antialias;

    // @TODO: Include render target in clear operation.
    if (antialias === true) {
      colorAttachment.view = this.colorBuffer.createView();
      colorAttachment.resolveTarget = this.context.getCurrentTexture().createView();
    } else {
      colorAttachment.view = this.context.getCurrentTexture().createView();
      colorAttachment.resolveTarget = undefined;
    }

    descriptor.depthStencilAttachment.view = this.#getDepthBufferGPU(renderContext).createView();

    if (color) {
      colorAttachment.loadOp = GPULoadOp.Clear;
      colorAttachment.clearValue = renderContext.clearColorValue;
    } else {
      colorAttachment.loadOp = GPULoadOp.Load;
    }

    if (depth) {
      depthStencilAttachment.depthLoadOp = GPULoadOp.Clear;
      depthStencilAttachment.depthClearValue = renderContext.clearDepthValue;
    } else {
      depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
    }

    if (stencil) {
      depthStencilAttachment.stencilLoadOp = GPULoadOp.Clear;
      depthStencilAttachment.stencilClearValue = renderContext.clearStencilValue;
    } else {
      depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;
    }

    renderContextData.encoder = device.createCommandEncoder({});
    renderContextData.currentPass = renderContextData.encoder.beginRenderPass(descriptor);

    renderContextData.currentPass.end();

    device.queue.submit([renderContextData.encoder.finish()]);
  }

  // compute

  beginCompute(computeGroup) {
    const groupGPU = this.get(computeGroup);

    groupGPU.cmdEncoderGPU = this.device.createCommandEncoder({});
    groupGPU.passEncoderGPU = groupGPU.cmdEncoderGPU.beginComputePass();
  }

  compute(computeGroup, computeNode, bindings, pipeline) {
    const { passEncoderGPU } = this.get(computeGroup);

    // pipeline

    const pipelineGPU = this.get(pipeline).pipeline;
    passEncoderGPU.setPipeline(pipelineGPU);

    // bind group

    const bindGroupGPU = this.get(bindings).group;
    passEncoderGPU.setBindGroup(0, bindGroupGPU);

    passEncoderGPU.dispatchWorkgroups(computeNode.dispatchCount);
  }

  finishCompute(computeGroup) {
    const groupData = this.get(computeGroup);

    groupData.passEncoderGPU.end();
    this.device.queue.submit([groupData.cmdEncoderGPU.finish()]);
  }

  // render object

  draw(renderObject, info) {
    const { object, geometry, context, pipeline } = renderObject;

    const bindingsData = this.get(renderObject.getBindings());
    const contextData = this.get(context);
    const pipelineGPU = this.get(pipeline).pipeline;
    const attributesSet = contextData.currentAttributesSet;

    // pipeline

    const passEncoderGPU = contextData.currentPass;
    passEncoderGPU.setPipeline(pipelineGPU);

    // bind group

    const bindGroupGPU = bindingsData.group;
    passEncoderGPU.setBindGroup(0, bindGroupGPU);

    // attributes

    const index = renderObject.getIndex();

    const hasIndex = index !== null;

    // index

    if (hasIndex === true) {
      if (attributesSet.index !== index) {
        const buffer = this.get(index).buffer;
        const indexFormat = index.array instanceof Uint16Array ? GPUIndexFormat.Uint16 : GPUIndexFormat.Uint32;

        passEncoderGPU.setIndexBuffer(buffer, indexFormat);

        attributesSet.index = index;
      }
    }

    // vertex buffers

    const vertexBuffers = renderObject.getVertexBuffers();

    for (let i = 0, l = vertexBuffers.length; i < l; i++) {
      const vertexBuffer = vertexBuffers[i];

      if (attributesSet[i] !== vertexBuffer) {
        const buffer = this.get(vertexBuffer).buffer;
        passEncoderGPU.setVertexBuffer(i, buffer);

        attributesSet[i] = vertexBuffer;
      }
    }

    // draw

    const drawRange = geometry.drawRange;
    const firstVertex = drawRange.start;

    const instanceCount = this.getInstanceCount(renderObject);

    if (hasIndex === true) {
      const indexCount = drawRange.count !== Infinity ? drawRange.count : index.count;

      passEncoderGPU.drawIndexed(indexCount, instanceCount, firstVertex, 0, 0);

      info.update(object, indexCount, instanceCount);
    } else {
      const positionAttribute = geometry.attributes.position;
      const vertexCount = drawRange.count !== Infinity ? drawRange.count : positionAttribute.count;

      passEncoderGPU.draw(vertexCount, instanceCount, firstVertex, 0);

      info.update(object, vertexCount, instanceCount);
    }
  }

  // cache key

  needsUpdate(renderObject) {
    const renderObjectGPU = this.get(renderObject);

    const { object, material } = renderObject;

    const sampleCount = this.utilites.findSampleCount(renderObject.context);
    const colorSpace = this.utilites.findCurrentColorSpace(renderObject.context);
    const colorFormat = this.utilites.findCurrentColorFormat(renderObject.context);
    const depthStencilFormat = this.utilites.findCurrentDepthStencilFormat(renderObject.context);
    const primitiveTopology = this.utilites.findPrimitiveTopology(object, material);

    let needsUpdate = false;

    if (
      renderObjectGPU.sampleCount !== sampleCount ||
      renderObjectGPU.colorSpace !== colorSpace ||
      renderObjectGPU.colorFormat !== colorFormat ||
      renderObjectGPU.depthStencilFormat !== depthStencilFormat ||
      renderObjectGPU.primitiveTopology !== primitiveTopology
    ) {
      renderObjectGPU.sampleCount = sampleCount;
      renderObjectGPU.colorSpace = colorSpace;
      renderObjectGPU.colorFormat = colorFormat;
      renderObjectGPU.depthStencilFormat = depthStencilFormat;
      renderObjectGPU.primitiveTopology = primitiveTopology;

      needsUpdate = true;
    }

    return needsUpdate;
  }

  getCacheKey(renderObject) {
    const { object, material } = renderObject;

    const renderContext = renderObject.context;

    return [
      this.utilites.findSampleCount(renderContext),
      this.utilites.findCurrentColorSpace(renderContext),
      this.utilites.findCurrentColorFormat(renderContext),
      this.utilites.findCurrentDepthStencilFormat(renderContext),
      this.utilites.findPrimitiveTopology(object, material),
    ].join();
  }

  // textures

  createSampler(texture) {
    this.textures.createSampler(texture);
  }

  destroySampler(texture) {
    this.textures.destroySampler(texture);
  }

  createDefaultTexture(texture) {
    this.textures.applyTexture(texture);
  }

  createTexture(texture, options) {
    this.textures.createTexture(texture, options);
  }

  updateTexture(texture) {
    this.textures.updateTexture(texture);
  }

  destroyTexture(texture) {
    this.textures.destroyTexture(texture);
  }

  copyTextureToBuffer(texture, x, y, width, height) {
    return this.textures.copyTextureToBuffer(texture, x, y, width, height);
  }

  // node builder

  createNodeBuilder(object, renderer, scene = null) {
    return new WebGPUNodeBuilder(object, renderer, scene);
  }

  // program

  createProgram(program) {
    const programGPU = this.get(program);

    programGPU.module = {
      module: this.device.createShaderModule({ code: program.code, label: program.stage }),
      entryPoint: 'main',
    };
  }

  destroyProgram = program => this.delete(program);

  // pipelines
  createRenderPipeline = renderable => this.pipelines.createRender(renderable);
  createComputePipeline = (computePipeline, bindings) => this.pipelines.createCompute(computePipeline, bindings);

  // bindings
  createBindings = bindings => this.bindings.create(bindings);
  updateBindings = bindings => this.bindings.create(bindings);
  updateBinding = binding => this.bindings.update(binding);

  // attributes

  createIndexAttribute = attribute =>
    this.attributes.create(attribute, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST);

  createVertexAttribute = attribute =>
    this.attributes.create(attribute, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST);

  createStorageAttribute = attribute =>
    this.attributes.create(
      attribute,
      GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    );

  updateAttribute = attribute => this.attributes.update(attribute);
  destroyAttribute = attribute => this.attributes.destroy(attribute);

  // canvas
  updateSize() {
    this.#configureContext();
    this.#setupColorBuffer();
  }

  // utils public

  hasFeature(name) {
    const features = Object.values(GPUFeatureName);

    if (!features.includes(name)) throw Error(`THREE.WebGPURenderer: Unknown WebGPU GPU feature: ${name}`);

    return this.adapter.features.has(name);
  }

  copyFramebufferToTexture(texture, renderContext) {
    const renderContextData = this.get(renderContext);

    const { encoder, descriptor } = renderContextData;

    let sourceGPU = null;

    if (texture.isFramebufferTexture) {
      sourceGPU = this.context.getCurrentTexture();
    } else if (texture.isDepthTexture) {
      sourceGPU = this.#getDepthBufferGPU(renderContext);
    }

    const destinationGPU = this.get(texture).texture;

    renderContextData.currentPass.end();

    encoder.copyTextureToTexture(
      {
        texture: sourceGPU,
        origin: { x: 0, y: 0, z: 0 },
      },
      {
        texture: destinationGPU,
      },
      [texture.image.width, texture.image.height],
    );

    if (texture.generateMipmaps) this.textures.mipmap(texture);

    descriptor.colorAttachments[0].loadOp = GPULoadOp.Load;
    if (renderContext.depth) descriptor.depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
    if (renderContext.stencil) descriptor.depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;

    renderContextData.currentPass = encoder.beginRenderPass(descriptor);
    renderContextData.currentAttributesSet = {};
  }

  #getDepthBufferGPU(renderContext) {
    const { width, height } = this.getDrawingBufferSize();

    const depthTexture = this.defaultDepthTexture;
    const depthTextureGPU = this.get(depthTexture).texture;

    let format, type;

    if (renderContext.stencil) {
      format = DepthStencilFormat;
      type = UnsignedInt248Type;
    } else if (renderContext.depth) {
      format = DepthFormat;
      type = UnsignedIntType;
    }

    if (depthTextureGPU !== undefined) {
      if (
        depthTexture.image.width === width &&
        depthTexture.image.height === height &&
        depthTexture.format === format &&
        depthTexture.type === type
      ) {
        return depthTextureGPU;
      }

      this.textures.destroyTexture(depthTexture);
    }

    depthTexture.name = 'depthBuffer';
    depthTexture.format = format;
    depthTexture.type = type;
    depthTexture.image.width = width;
    depthTexture.image.height = height;

    this.textures.createTexture(depthTexture, { sampleCount: this.parameters.sampleCount });

    return this.get(depthTexture).texture;
  }

  #configureContext() {
    this.context.configure({
      device: this.device,
      format: GPUTextureFormat.BGRA8Unorm,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
      alphaMode: 'premultiplied',
    });
  }

  #setupColorBuffer() {
    if (this.colorBuffer) this.colorBuffer.destroy();

    const { width, height } = this.getDrawingBufferSize();

    this.colorBuffer = this.device.createTexture({
      label: 'colorBuffer',
      size: { width, height, depthOrArrayLayers: 1 },
      sampleCount: this.parameters.sampleCount,
      format: GPUTextureFormat.BGRA8Unorm,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });
  }
}

export const createOrganizer = parameters => new Organizer(parameters);
