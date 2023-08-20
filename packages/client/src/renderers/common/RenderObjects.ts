import DataMap from './DataMap.ts';
import ChainMap from './ChainMap.ts';
import RenderObject from './RenderObject.ts';
import { Renderer } from '../webgpu/createRenderer.js';
import Nodes from './nodes/Nodes.js';
import { Geometries } from './Geometries.js';

class RenderObjects {
  constructor(renderer, nodes, geometries, pipelines, bindings, info) {
    this.renderer = renderer;
    this.nodes = nodes;
    this.geometries = geometries;
    this.pipelines = pipelines;
    this.bindings = bindings;
    this.info = info;

    this.chains = {};
    this.map = new DataMap();
  }

  get(object, material, scene, camera, lightsNode, renderContext, passId) {
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

  createRenderObject(nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext, passId) {
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
export const createRenderObjects = (
  renderer: Renderer,
  nodes: Nodes,
  geometries: Geometries,
  pipelines,
  bindings,
  info,
) => new RenderObjects(renderer, nodes, geometries, pipelines, bindings, info);
