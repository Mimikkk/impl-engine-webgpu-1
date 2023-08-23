import type Nodes from './nodes/Nodes.js';
import type { Geometries } from './Geometries.js';
import type { Renderer } from '../webgpu/createRenderer.js';
let id = 0;

export default class RenderObject {
  _nodes: Nodes;
  private _geometries: Geometries;
  id: number;
  renderer: Renderer;
  onMaterialDispose: () => void;
  onDispose: (() => void) | null;
  object: any;
  material: any;
  scene: any;
  camera: any;
  lightsNode: any;
  context: any;
  geometry: any;
  attributes: any;
  pipeline: any;
  vertexBuffers: any;
  _materialVersion: number;
  _materialCacheKey: string;

  constructor(
    nodes: Nodes,
    geometries: Geometries,
    renderer: Renderer,
    object: any,
    material: any,
    scene: any,
    camera: any,
    lightsNode: any,
    renderContext: any,
  ) {
    this._nodes = nodes;
    this._geometries = geometries;

    this.id = ++id;

    this.renderer = renderer;
    this.object = object;
    this.material = material;
    this.scene = scene;
    this.camera = camera;
    this.lightsNode = lightsNode;
    this.context = renderContext;

    this.geometry = object.geometry;

    this.attributes = null;
    this.pipeline = null;
    this.vertexBuffers = null;

    this._materialVersion = -1;
    this._materialCacheKey = '';

    this.onDispose = null;

    this.onMaterialDispose = () => {
      this.dispose();
      this.material.removeEventListener('dispose', this.onMaterialDispose);
    };
    this.material.addEventListener('dispose', this.onMaterialDispose);
  }

  getNodeBuilder = () => this._nodes.getForRender(this);
  getBindings = () => this.getNodeBuilder().getBindings();
  getIndex = () => this._geometries.getIndex(this);
  getChainArray = () => [this.object, this.material, this.context, this.lightsNode];

  getAttributes() {
    if (this.attributes) return this.attributes;

    const nodeAttributes = this.getNodeBuilder().getAttributesArray();
    const geometry = this.geometry;

    const attributes = [];
    const vertexBuffers = new Set();

    for (const nodeAttribute of nodeAttributes) {
      const attribute =
        nodeAttribute.node && nodeAttribute.node.attribute
          ? nodeAttribute.node.attribute
          : geometry.getAttribute(nodeAttribute.name);

      attributes.push(attribute);

      const bufferAttribute = attribute.isInterleavedBufferAttribute ? attribute.data : attribute;
      vertexBuffers.add(bufferAttribute);
    }

    this.attributes = attributes;
    this.vertexBuffers = Array.from(vertexBuffers.values());

    return attributes;
  }

  getVertexBuffers() {
    if (!this.vertexBuffers) this.getAttributes();
    return this.vertexBuffers;
  }

  getCacheKey() {
    if (this.material.version !== this._materialVersion) {
      this._materialVersion = this.material.version;
      this._materialCacheKey = this.material.customProgramCacheKey();
    }

    return `{material:${this._materialCacheKey},nodes:${this._nodes.getCacheKey(this.scene, this.lightsNode)}}`;
  }

  dispose = () => this.onDispose?.();
}
export const createRenderObject = (
  nodes: Nodes,
  geometries: Geometries,
  renderer: Renderer,
  object: any,
  material: any,
  scene: any,
  camera: any,
  lightsNode: any,
  renderContext: any,
  onDispose: (() => void) | null = null,
) => {
  return {
    dispose: () => onDispose?.(),
  };
};
