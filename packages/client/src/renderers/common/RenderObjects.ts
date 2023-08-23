import DataMap from './DataMap.js';
import ChainMap from './ChainMap.js';
import RenderObject from './RenderObject.js';
import { Renderer } from '../webgpu/createRenderer.js';
import Nodes from './nodes/Nodes.js';
import { Geometries } from './Geometries.js';
import Pipelines from './Pipelines.js';
import Bindings from './Bindings.js';
import { Statistics } from './createStatistics.js';

class RenderObjects {
  renderer: Renderer;
  nodes: Nodes;
  geometries: Geometries;
  pipelines: Pipelines;
  bindings: Bindings;
  info: Statistics;
  chains: any;
  map: DataMap<any>;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.nodes = renderer.nodes;
    this.geometries = renderer.geometries;
    this.pipelines = renderer.pipelines;
    this.bindings = renderer.bindings;
    this.info = renderer.statistics;

    this.chains = {};
    this.map = new DataMap();
  }

  get(object: any, material: any, scene: any, camera: any, lightsNode: any, renderContext: any, passId: any) {
    const chainMap = this.getChainMap(passId);
    const chainArray = [object, material, renderContext, lightsNode];

    let renderObject = chainMap.get(chainArray);

    if (renderObject === undefined) {
      renderObject = this.createRenderObject(
        this.nodes,
        this.geometries,
        this.renderer,
        object,
        material,
        scene,
        camera,
        lightsNode,
        renderContext,
        passId,
      );

      chainMap.set(chainArray, renderObject);
    } else {
      const data = this.map.get(renderObject);
      const cacheKey = renderObject.getCacheKey();

      if (data.cacheKey !== cacheKey) {
        renderObject.dispose();

        renderObject = this.get(object, material, scene, camera, lightsNode, renderContext, passId);
      }
    }

    return renderObject;
  }

  getChainMap = (passId = 'default') => this.chains[passId] || (this.chains[passId] = new ChainMap());

  dispose() {
    this.chains = {};
    this.map = new DataMap();
  }

  createRenderObject(
    nodes: any,
    geometries: any,
    renderer: any,
    object: any,
    material: any,
    scene: any,
    camera: any,
    lightsNode: any,
    renderContext: any,
    passId: any,
  ) {
    const chainMap = this.getChainMap(passId);
    const dataMap = this.map;

    const renderObject = new RenderObject(
      nodes,
      geometries,
      renderer,
      object,
      material,
      scene,
      camera,
      lightsNode,
      renderContext,
    );

    const data = dataMap.get(renderObject);
    data.cacheKey = renderObject.getCacheKey();

    renderObject.onDispose = () => {
      dataMap.delete(renderObject);

      this.pipelines.delete(renderObject);
      this.bindings.delete(renderObject);
      this.nodes.delete(renderObject);

      chainMap.delete(renderObject.getChainArray());
    };

    return renderObject;
  }
}

export default RenderObjects;
