import { createOrganizer, Organizer } from './createOrganizer.js';
import { createUpdateLoop, UpdateLoop } from './common/createUpdateLoop.js';
import RenderObjects from './common/RenderObjects.js';
import Attributes from './common/Attributes.js';
import { createGeometries, Geometries } from './common/Geometries.js';
import { createStatistics, Statistics } from './common/createStatistics.js';
import Pipelines from './common/Pipelines.js';
import Bindings from './common/Bindings.js';
import { createRenderLists, RenderLists } from './common/RenderLists.js';
import { createRenderContexts, RenderContexts } from './common/RenderContexts.js';
import { createTextures, Textures } from './common/Textures.js';
import { Background, createBackground } from './common/Background.js';
import Nodes from './common/nodes/Nodes.js';
import { Frustum, Matrix4, Scene, Vector2, Vector3, Vector4 } from 'three';
import { BackSide, DoubleSide, FrontSide, NoToneMapping, SRGBColorSpace } from './common/Constants.js';
import { Color } from './core/Color.js';
const _scene = new Scene();
const _drawingBufferSize = new Vector2();
const _screen = new Vector4();
const _frustum = new Frustum();
const _projScreenMatrix = new Matrix4();
const _vector3 = new Vector3();

export class Renderer {
  initializer: null | Promise<void>;
  _initialized: boolean;
  _renderTarget: null;
  _clearDepth: number;
  _clearStencil: number;
  _clearAlpha: number;
  _clearColor: Color;
  _transparentSort: null;
  _opaqueSort: null;
  _currentRenderContext: null;
  _lastRenderContext: null;

  _animation: UpdateLoop;
  textures: Textures;
  background: Background;
  renderContexts: RenderContexts;
  pipelines: Pipelines;
  renderObjects: RenderObjects;
  renderLists: RenderLists;
  nodes: Nodes;
  bindings: Bindings;
  geometries: Geometries;
  attributes: Attributes;
  statistics: Statistics;

  _scissorTest: boolean;
  _scissor: Vector4;
  _viewport: Vector4;
  _width: any;
  _height: any;
  _pixelRatio: number;
  stencil: boolean;
  depth: boolean;
  sortObjects: boolean;
  toneMapping: number;
  toneMappingExposure: number;
  outputColorSpace: string;
  autoClearStencil: boolean;
  autoClearDepth: boolean;
  autoClear: boolean;
  organizer: Organizer;
  domElement: HTMLCanvasElement;
  autoClearColor: boolean;
  _context: any;
  _activeCubeFace: number;

  constructor(parameters = {}) {
    const organizer = createOrganizer(parameters);
    this.domElement = organizer.getDomElement();
    this.organizer = organizer;

    this.autoClear = true;
    this.autoClearColor = true;
    this.autoClearDepth = true;
    this.autoClearStencil = true;

    this.outputColorSpace = SRGBColorSpace;

    this.toneMapping = NoToneMapping;
    this.toneMappingExposure = 1.0;

    this.sortObjects = true;

    this.depth = true;
    this.stencil = true;

    // internals
    this._pixelRatio = 1;
    this._width = this.domElement.width;
    this._height = this.domElement.height;

    this._viewport = new Vector4(0, 0, this._width, this._height);
    this._scissor = new Vector4(0, 0, this._width, this._height);
    this._scissorTest = false;

    this.statistics = null as never;
    this.attributes = null as never;
    this.geometries = null as never;
    this.nodes = null as never;
    this.bindings = null as never;
    this.renderObjects = null as never;
    this.pipelines = null as never;
    this.renderLists = null as never;
    this.renderContexts = null as never;
    this.textures = null as never;
    this.background = null as never;

    this._animation = createUpdateLoop({
      immediate: false,
      updatesPerSecond: 5,
      rendersPerSecond: 144,
    });

    this._currentRenderContext = null;
    this._lastRenderContext = null;

    this._opaqueSort = null;
    this._transparentSort = null;

    this._clearAlpha = 1;
    this._clearColor = new Color(0);
    this._clearDepth = 1;
    this._clearStencil = 0;

    this._renderTarget = null;

    this._initialized = false;
    this.initializer = null;
  }

  async initialize() {
    if (this._initialized) throw new Error('Renderer: Backend has already been initialized.');

    if (this.initializer) return this.initializer;

    this.initializer = new Promise(async (resolve, reject) => {
      const api = this.organizer;

      try {
        await api.init(this);
      } catch (error) {
        reject(error);
        return;
      }

      this.statistics = createStatistics(this);
      this.nodes = new Nodes(this);
      this.attributes = new Attributes(this);
      this.background = createBackground(this);
      this.geometries = createGeometries(this);
      this.textures = createTextures(this);
      this.pipelines = new Pipelines(this);
      this.bindings = new Bindings(this);
      this.renderObjects = new RenderObjects(this);
      this.renderLists = createRenderLists(this);
      this.renderContexts = createRenderContexts(this);

      this._animation.actions.changeNodes(this.nodes);
      this._animation.actions.start();
      this._initialized = true;

      resolve();
    });

    return this.initializer;
  }

  get coordinateSystem() {
    return this.organizer.coordinateSystem;
  }

  async render(scene: any, camera: any) {
    if (!this._initialized) await this.initialize();

    // preserve render tree

    const nodeFrame = this.nodes.nodeFrame;

    const previousRenderId = nodeFrame.frameId;
    const previousRenderState = this._currentRenderContext;

    //

    const sceneRef = scene.isScene ? scene : _scene;

    const renderTarget = this._renderTarget as any;
    const renderContext = this.renderContexts.get(scene, camera, renderTarget);
    const activeCubeFace = this._activeCubeFace;

    this._currentRenderContext = renderContext;

    nodeFrame.frameId++;

    //
    if (camera.coordinateSystem !== this.coordinateSystem) {
      camera.coordinateSystem = this.coordinateSystem;
      camera.updateProjectionMatrix();
    }

    //
    if (!this._animation.state.ongoing) nodeFrame.update();

    if (scene.matrixWorldAutoUpdate) scene.updateMatrixWorld();

    if (camera.parent === null && camera.matrixWorldAutoUpdate) camera.updateMatrixWorld();

    if (this.statistics.autoReset) this.statistics.reset();
    this.statistics.render.frame++;

    //
    let viewport = this._viewport as any;
    let scissor = this._scissor;
    let pixelRatio = this._pixelRatio;

    if (renderTarget) {
      viewport = renderTarget.viewport;
      scissor = renderTarget.scissor;
      pixelRatio = 1;
    }

    this.getDrawingBufferSize(_drawingBufferSize);

    _screen.set(0, 0, _drawingBufferSize.width, _drawingBufferSize.height);

    const minDepth = viewport?.minDepth ?? 0;
    const maxDepth = viewport?.maxDepth ?? 1;

    renderContext.viewportValue.copy(viewport).multiplyScalar(pixelRatio).floor();
    renderContext.viewportValue.minDepth = minDepth;
    renderContext.viewportValue.maxDepth = maxDepth;
    renderContext.viewport = renderContext.viewportValue.equals(_screen) === false;

    renderContext.scissorValue.copy(scissor).multiplyScalar(pixelRatio).floor();
    renderContext.scissor = this._scissorTest && renderContext.scissorValue.equals(_screen) === false;

    renderContext.depth = this.depth;
    renderContext.stencil = this.stencil;

    //

    sceneRef.onBeforeRender(this, scene, camera, renderTarget);

    //

    _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    _frustum.setFromProjectionMatrix(_projScreenMatrix, this.coordinateSystem as any);

    const renderList = this.renderLists.get([scene, camera]) as any;
    renderList.init();

    this._projectObject(scene, camera, 0, renderList);

    renderList.finish();

    if (this.sortObjects === true) {
      renderList.sort(this._opaqueSort, this._transparentSort);
    }

    //

    if (renderTarget !== null) {
      this.textures.updateRenderTarget(renderTarget);

      const renderTargetData = this.textures.get(renderTarget);

      renderContext.texture = renderTargetData.texture;
      renderContext.depthTexture = renderTargetData.depthTexture;
    } else {
      renderContext.texture = null;
      renderContext.depthTexture = null;
    }

    renderContext.activeCubeFace = activeCubeFace;
    this.nodes.updateScene(sceneRef);
    this.background.update(sceneRef, renderList, renderContext);
    this.organizer.beginRender(renderContext);

    // process render lists

    const opaqueObjects = renderList.opaque;
    const transparentObjects = renderList.transparent;
    const lightsNode = renderList.lightsNode;

    if (opaqueObjects.length > 0) this._renderObjects(opaqueObjects, camera, sceneRef, lightsNode);
    if (transparentObjects.length > 0) this._renderObjects(transparentObjects, camera, sceneRef, lightsNode);

    // finish render pass

    this.organizer.finishRender(renderContext);

    // restore render tree

    nodeFrame.frameId = previousRenderId;
    this._currentRenderContext = previousRenderState;

    this._lastRenderContext = renderContext;

    //

    sceneRef.onAfterRender(this, scene, camera, renderTarget);
  }

  setAnimationLoop(animate: any) {
    if (!this._initialized) this.initialize();

    this._animation.state.render = animate;
    animate ? this._animation.actions.start() : this._animation.actions.stop();
  }

  async getArrayBufferAsync(attribute: any) {
    return await this.organizer.getArrayBufferAsync(attribute);
  }

  getContext() {
    return this._context;
  }

  getDrawingBufferSize = (target: any) =>
    target.set(this._width * this._pixelRatio, this._height * this._pixelRatio).floor();

  setPixelRatio = (value = 1) => {
    this._pixelRatio = value;

    this.setSize(this._width, this._height, false);
  };

  setSize(width: number, height: number, updateStyle: boolean = true) {
    this._width = width;
    this._height = height;

    this.domElement.width = Math.floor(width * this._pixelRatio);
    this.domElement.height = Math.floor(height * this._pixelRatio);

    if (updateStyle === true) {
      this.domElement.style.width = width + 'px';
      this.domElement.style.height = height + 'px';
    }

    this.setViewport(0, 0, width, height);

    if (this._initialized) this.organizer.updateSize();
  }

  setViewport(x: any, y: number, width: number, height: number, minDepth: number = 0, maxDepth: number = 1) {
    const viewport = this._viewport as any;

    if (x.isVector4) {
      viewport.copy(x);
    } else {
      viewport.set(x, y, width, height);
    }

    viewport.minDepth = minDepth;
    viewport.maxDepth = maxDepth;
  }

  clear(color: boolean, depth: boolean, stencil: boolean) {
    const renderContext = this._currentRenderContext || this._lastRenderContext;

    if (renderContext) this.organizer.clear(renderContext, color, depth, stencil);
  }
  clearColor = () => this.clear(true, false, false);
  clearDepth = () => this.clear(false, true, false);
  clearStencil = () => this.clear(false, false, true);

  dispose() {
    this.renderObjects.dispose();
    this.pipelines.dispose();
    this.nodes.dispose();
    this.bindings.dispose();
    this.statistics.dispose();
    this.renderLists.dispose();
    this.renderContexts.dispose();
    this.textures.dispose();

    this.setRenderTarget(null);
    this.setAnimationLoop(null);
  }

  setRenderTarget(renderTarget: any, activeCubeFace: number = 0) {
    this._renderTarget = renderTarget;
    this._activeCubeFace = activeCubeFace;
  }

  getRenderTarget() {
    return this._renderTarget;
  }

  async compute(computeNodes: any) {
    if (!this._initialized) await this.initialize();

    const backend = this.organizer;
    const pipelines = this.pipelines;
    const bindings = this.bindings;
    const nodes = this.nodes;
    const computeList = Array.isArray(computeNodes) ? computeNodes : [computeNodes];

    backend.beginCompute(computeNodes);

    for (const computeNode of computeList) {
      // onInit

      if (!pipelines.has(computeNode)) {
        const dispose = () => {
          computeNode.removeEventListener('dispose', dispose);

          pipelines.delete(computeNode);
          bindings.delete(computeNode);
          nodes.delete(computeNode);
        };

        computeNode.addEventListener('dispose', dispose);

        //

        computeNode.onInit({ renderer: this });
      }

      //@ts-expect-error
      nodes.updateForCompute(computeNode);
      bindings.updateForCompute(computeNode);

      const computeBindings = bindings.getForCompute(computeNode);
      const computePipeline = pipelines.getForCompute(computeNode, computeBindings);

      backend.compute(computeNodes, computeNode, computeBindings, computePipeline);
    }

    backend.finishCompute(computeNodes);
  }

  _projectObject(object: any, camera: any, groupOrder: any, renderList: any) {
    if (object.visible === false) return;

    const visible = object.layers.test(camera.layers);

    if (visible) {
      if (object.isGroup) {
        groupOrder = object.renderOrder;
      } else if (object.isLOD) {
        if (object.autoUpdate === true) object.update(camera);
      } else if (object.isLight) {
        renderList.pushLight(object);
      } else if (object.isSprite) {
        if (!object.frustumCulled || _frustum.intersectsSprite(object)) {
          if (this.sortObjects === true) {
            _vector3.setFromMatrixPosition(object.matrixWorld).applyMatrix4(_projScreenMatrix);
          }

          const geometry = object.geometry;
          const material = object.material;

          if (material.visible) {
            renderList.push(object, geometry, material, groupOrder, _vector3.z, null);
          }
        }
      } else if (object.isLineLoop) {
        console.error(
          'THREE.Renderer: Objects of type THREE.LineLoop are not supported. Please use THREE.Line or THREE.LineSegments.',
        );
      } else if (object.isMesh || object.isLine || object.isPoints) {
        if (!object.frustumCulled || _frustum.intersectsObject(object)) {
          const geometry = object.geometry;
          const material = object.material;

          if (this.sortObjects === true) {
            if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

            _vector3
              .copy(geometry.boundingSphere.center)
              .applyMatrix4(object.matrixWorld)
              .applyMatrix4(_projScreenMatrix);
          }

          if (Array.isArray(material)) {
            const groups = geometry.groups;

            for (let i = 0, l = groups.length; i < l; i++) {
              const group = groups[i];
              const groupMaterial = material[group.materialIndex];

              if (groupMaterial && groupMaterial.visible) {
                renderList.push(object, geometry, groupMaterial, groupOrder, _vector3.z, group);
              }
            }
          } else if (material.visible) {
            renderList.push(object, geometry, material, groupOrder, _vector3.z, null);
          }
        }
      }
    }

    const children = object.children;

    for (let i = 0, l = children.length; i < l; i++) {
      this._projectObject(children[i], camera, groupOrder, renderList);
    }
  }

  _renderObjects(renderList: any, camera: any, scene: any, lightsNode: any) {
    // process renderable objects

    for (let i = 0, il = renderList.length; i < il; i++) {
      const renderItem = renderList[i];

      // @TODO: Add support for multiple materials per object. This will require to extract
      // the material from the renderItem object and pass it with its group data to _renderObject().

      const { object, geometry, material, group } = renderItem;

      if (camera.isArrayCamera) {
        const cameras = camera.cameras;

        for (let j = 0, jl = cameras.length; j < jl; j++) {
          const camera2 = cameras[j];

          if (object.layers.test(camera2.layers)) {
            const vp = camera2.viewport;
            const minDepth = vp.minDepth === undefined ? 0 : vp.minDepth;
            const maxDepth = vp.maxDepth === undefined ? 1 : vp.maxDepth;

            //@ts-expect-error
            const viewportValue = this._currentRenderContext.viewportValue;
            viewportValue.copy(vp).multiplyScalar(this._pixelRatio).floor();
            viewportValue.minDepth = minDepth;
            viewportValue.maxDepth = maxDepth;

            this.organizer.updateViewport(this._currentRenderContext);

            this._renderObject(object, scene, camera2, geometry, material, group, lightsNode);
          }
        }
      } else {
        this._renderObject(object, scene, camera, geometry, material, group, lightsNode);
      }
    }
  }

  _renderObject(object: any, scene: any, camera: any, geometry: any, material: any, group: any, lightsNode: any) {
    material = scene.overrideMaterial !== null ? scene.overrideMaterial : material;

    //

    object.onBeforeRender(this, scene, camera, geometry, material, group);

    material.onBeforeRender(this, scene, camera, geometry, material, group);

    //

    if (material.transparent === true && material.side === DoubleSide && material.forceSinglePass === false) {
      material.side = BackSide;
      this._renderObjectDirect(object, material, scene, camera, lightsNode, 'backSide');

      material.side = FrontSide;
      this._renderObjectDirect(object, material, scene, camera, lightsNode, undefined);

      material.side = DoubleSide;
    } else {
      this._renderObjectDirect(object, material, scene, camera, lightsNode, undefined);
    }

    //

    object.onAfterRender(this, scene, camera, geometry, material, group);
  }

  _renderObjectDirect(object: any, material: any, scene: any, camera: any, lightsNode: any, passId: any) {
    const renderObject = this.renderObjects.get(
      object,
      material,
      scene,
      camera,
      lightsNode,
      this._currentRenderContext,
      passId,
    );

    this.nodes.updateBefore(renderObject);
    object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
    object.normalMatrix.getNormalMatrix(object.modelViewMatrix);
    this.nodes.updateForRender(renderObject);
    this.geometries.updateForRender(renderObject);
    this.bindings.updateForRender(renderObject);
    this.pipelines.updateForRender(renderObject);
    this.organizer.draw(renderObject, this.statistics);
  }

  copyFramebufferToTexture(framebufferTexture: any) {
    const renderContext = this._currentRenderContext || this._lastRenderContext;

    this.textures.updateTexture(framebufferTexture);

    this.organizer.copyFramebufferToTexture(framebufferTexture, renderContext);
  }
}

export const createRenderer = (parameters: any) => new Renderer(parameters);
