import DataMap from './DataMap.js';
import { createRenderPipeline } from './RenderPipeline.js';
import { createComputePipeline } from './ComputePipeline.js';
import { createProgrammableStage } from './ProgrammableStage.js';
import Nodes from './nodes/Nodes.js';
import { Organizer } from '../webgpu/createOrganizer.js';
import Bindings from './Bindings.js';
import { ShaderStage } from './ShaderStage.js';
import { Renderer } from '../webgpu/createRenderer.js';

class Pipelines {
  api: Organizer;
  map: DataMap<{ pipeline: any; version: number }>;
  nodes: any;
  caches: Map<any, any>;
  programs: { vertex: Map<any, any>; fragment: Map<any, any>; compute: Map<any, any> };

  constructor(renderer: Renderer) {
    this.map = new DataMap();
    this.api = renderer.backend;
    this.nodes = renderer.nodes;

    this.caches = new Map();
    this.programs = {
      vertex: new Map(),
      fragment: new Map(),
      compute: new Map(),
    };
  }

  getForCompute(computeNode: any, bindings: Bindings) {
    const data = this.get(computeNode);

    if (this._needsComputeUpdate(computeNode)) {
      const previousPipeline = data.pipeline;

      if (previousPipeline) {
        previousPipeline.usedTimes--;
        previousPipeline.computeProgram.usedTimes--;
      }
      const builder = this.nodes.getForCompute(computeNode);

      let stageCompute = this.programs.compute.get(builder.computeShader);
      if (!stageCompute) {
        if (previousPipeline && previousPipeline.computeProgram.usedTimes === 0)
          this._releaseProgram(previousPipeline.computeProgram);

        stageCompute = createProgrammableStage(builder.computeShader, ShaderStage.Compute);
        this.programs.compute.set(builder.computeShader, stageCompute);

        this.api.createProgram(stageCompute);
      }

      const cacheKey = this._getComputeCacheKey(computeNode, stageCompute);
      let pipeline = this.caches.get(cacheKey);

      if (!pipeline) {
        if (previousPipeline?.usedTimes === 0) this._releasePipeline(computeNode);
        pipeline = this._getComputePipeline(computeNode, stageCompute, cacheKey, bindings);
      }

      ++pipeline.usedTimes;
      ++stageCompute.usedTimes;
      data.version = computeNode.version;
      data.pipeline = pipeline;
    }

    return data.pipeline;
  }
  getForRender(renderObject: any) {
    const data = this.get(renderObject);

    if (this._needsRenderUpdate(renderObject)) {
      const previousPipeline = data.pipeline;

      if (previousPipeline) {
        previousPipeline.usedTimes--;
        previousPipeline.vertexProgram.usedTimes--;
        previousPipeline.fragmentProgram.usedTimes--;
      }

      // get shader

      const nodeBuilder = this.nodes.getForRender(renderObject);

      // programmable stages

      let stageVertex = this.programs.vertex.get(nodeBuilder.vertexShader);

      if (stageVertex === undefined) {
        if (previousPipeline && previousPipeline.vertexProgram.usedTimes === 0)
          this._releaseProgram(previousPipeline.vertexProgram);

        stageVertex = createProgrammableStage(nodeBuilder.vertexShader, ShaderStage.Vertex);
        this.programs.vertex.set(nodeBuilder.vertexShader, stageVertex);

        this.api.createProgram(stageVertex);
      }

      let stageFragment = this.programs.fragment.get(nodeBuilder.fragmentShader);

      if (stageFragment === undefined) {
        if (previousPipeline && previousPipeline.fragmentProgram.usedTimes === 0)
          this._releaseProgram(previousPipeline.fragmentProgram);

        stageFragment = createProgrammableStage(nodeBuilder.fragmentShader, ShaderStage.Fragment);
        this.programs.fragment.set(nodeBuilder.fragmentShader, stageFragment);

        this.api.createProgram(stageFragment);
      }

      // determine render pipeline

      const cacheKey = this._getRenderCacheKey(renderObject, stageVertex, stageFragment);

      let pipeline = this.caches.get(cacheKey);

      if (pipeline === undefined) {
        if (previousPipeline && previousPipeline.usedTimes === 0) this._releasePipeline(previousPipeline);

        pipeline = this._getRenderPipeline(renderObject, stageVertex, stageFragment, cacheKey);
      } else {
        renderObject.pipeline = pipeline;
      }

      // keep track of all used times

      pipeline.usedTimes++;
      stageVertex.usedTimes++;
      stageFragment.usedTimes++;

      //

      data.pipeline = pipeline;
    }

    return data.pipeline;
  }
  updateForRender(renderObject: any) {
    this.getForRender(renderObject);
  }

  get = (object: object) => this.map.get(object);
  has = (object: object) => this.map.has(object);
  delete(object: object) {
    const { pipeline } = this.get(object);

    if (pipeline) {
      --pipeline.usedTimes;
      if (pipeline.usedTimes === 0) this._releasePipeline(pipeline);

      if (pipeline.isComputePipeline) {
        if (--pipeline.computeProgram.usedTimes === 0) this._releaseProgram(pipeline.computeProgram);
      } else {
        if (--pipeline.vertexProgram.usedTimes === 0) this._releaseProgram(pipeline.vertexProgram);
        if (--pipeline.fragmentProgram.usedTimes === 0) this._releaseProgram(pipeline.fragmentProgram);
      }
    }

    this.map.delete(object);
  }
  dispose() {
    this.map = new DataMap();
    this.caches = new Map();
    this.programs.vertex = new Map();
    this.programs.fragment = new Map();
    this.programs.compute = new Map();
  }

  _getComputePipeline(computeNode: any, stageCompute: any, cacheKey: any, bindings: any) {
    cacheKey = cacheKey || this._getComputeCacheKey(computeNode, stageCompute);
    let pipeline = this.caches.get(cacheKey);

    if (!pipeline) {
      pipeline = createComputePipeline(cacheKey, stageCompute);
      this.caches.set(cacheKey, pipeline);
      this.api.createComputePipeline(pipeline, bindings);
    }

    return pipeline;
  }
  _getRenderPipeline(renderObject: any, stageVertex: any, stageFragment: any, cacheKey: any) {
    // check for existing pipeline

    cacheKey = cacheKey || this._getRenderCacheKey(renderObject, stageVertex, stageFragment);

    let pipeline = this.caches.get(cacheKey);

    if (pipeline === undefined) {
      pipeline = createRenderPipeline(cacheKey, stageVertex, stageFragment);

      this.caches.set(cacheKey, pipeline);

      renderObject.pipeline = pipeline;

      this.api.createRenderPipeline(renderObject);
    }

    return pipeline;
  }
  _getComputeCacheKey(computeNode: any, stageCompute: any) {
    return 'compute' + computeNode.id + stageCompute.id;
  }
  _getRenderCacheKey(renderObject: any, stageVertex: any, stageFragment: any) {
    const { material } = renderObject;

    const parameters = [
      stageVertex.id,
      stageFragment.id,
      material.transparent,
      material.blending,
      material.premultipliedAlpha,
      material.blendSrc,
      material.blendDst,
      material.blendEquation,
      material.blendSrcAlpha,
      material.blendDstAlpha,
      material.blendEquationAlpha,
      material.colorWrite,
      material.depthWrite,
      material.depthTest,
      material.depthFunc,
      material.stencilWrite,
      material.stencilFunc,
      material.stencilFail,
      material.stencilZFail,
      material.stencilZPass,
      material.stencilFuncMask,
      material.stencilWriteMask,
      material.side,
      this.api.getCacheKey(renderObject),
    ];

    return parameters.join();
  }
  _releasePipeline = (pipeline: any) => this.caches.delete(pipeline.cacheKey);
  _releaseProgram = ({ code, stage }: { code: string; stage: ShaderStage }) =>
    this.programs[this._programKey(stage)].delete(code);
  _programKey(stage: ShaderStage) {
    switch (stage) {
      case ShaderStage.Compute:
        return 'compute';
      case ShaderStage.Fragment:
        return 'fragment';
      case ShaderStage.Vertex:
        return 'vertex';
      default:
        throw Error('Invalid shader stage');
    }
  }
  _needsComputeUpdate(computeNode: any) {
    const data = this.get(computeNode);

    return data.pipeline === undefined || data.version !== computeNode.version;
  }
  _needsRenderUpdate(renderObject: any) {
    const data = this.get(renderObject) as any;
    const material = renderObject.material;

    let needsUpdate = this.api.needsUpdate(renderObject);

    // check material state

    if (
      data.material !== material ||
      data.materialVersion !== material.version ||
      data.transparent !== material.transparent ||
      data.blending !== material.blending ||
      data.premultipliedAlpha !== material.premultipliedAlpha ||
      data.blendSrc !== material.blendSrc ||
      data.blendDst !== material.blendDst ||
      data.blendEquation !== material.blendEquation ||
      data.blendSrcAlpha !== material.blendSrcAlpha ||
      data.blendDstAlpha !== material.blendDstAlpha ||
      data.blendEquationAlpha !== material.blendEquationAlpha ||
      data.colorWrite !== material.colorWrite ||
      data.depthWrite !== material.depthWrite ||
      data.depthTest !== material.depthTest ||
      data.depthFunc !== material.depthFunc ||
      data.stencilWrite !== material.stencilWrite ||
      data.stencilFunc !== material.stencilFunc ||
      data.stencilFail !== material.stencilFail ||
      data.stencilZFail !== material.stencilZFail ||
      data.stencilZPass !== material.stencilZPass ||
      data.stencilFuncMask !== material.stencilFuncMask ||
      data.stencilWriteMask !== material.stencilWriteMask ||
      data.side !== material.side ||
      data.alphaToCoverage !== material.alphaToCoverage
    ) {
      data.material = material;
      data.materialVersion = material.version;
      data.transparent = material.transparent;
      data.blending = material.blending;
      data.premultipliedAlpha = material.premultipliedAlpha;
      data.blendSrc = material.blendSrc;
      data.blendDst = material.blendDst;
      data.blendEquation = material.blendEquation;
      data.blendSrcAlpha = material.blendSrcAlpha;
      data.blendDstAlpha = material.blendDstAlpha;
      data.blendEquationAlpha = material.blendEquationAlpha;
      data.colorWrite = material.colorWrite;
      data.depthWrite = material.depthWrite;
      data.depthTest = material.depthTest;
      data.depthFunc = material.depthFunc;
      data.stencilWrite = material.stencilWrite;
      data.stencilFunc = material.stencilFunc;
      data.stencilFail = material.stencilFail;
      data.stencilZFail = material.stencilZFail;
      data.stencilZPass = material.stencilZPass;
      data.stencilFuncMask = material.stencilFuncMask;
      data.stencilWriteMask = material.stencilWriteMask;
      data.side = material.side;
      data.alphaToCoverage = material.alphaToCoverage;

      needsUpdate = true;
    }

    return needsUpdate || data.pipeline === undefined;
  }
}

export default Pipelines;
