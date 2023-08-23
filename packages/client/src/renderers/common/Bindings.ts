import { AttributeType } from './Constants.js';
import { Statistics } from './createStatistics.js';
import Nodes from './nodes/Nodes.js';
import Attributes from './Attributes.js';
import Pipelines from './Pipelines.js';
import { Textures } from './Textures.js';
import { Organizer } from '../webgpu/createOrganizer.js';
import { Renderer } from '../webgpu/createRenderer.js';

class Bindings {
  map = new WeakMap();
  backend: Organizer;
  textures: Textures;
  pipelines: Pipelines;
  attributes: Attributes;
  nodes: Nodes;
  info: Statistics;
  updateMap: WeakMap<object, any>;

  constructor(api: Renderer) {
    this.backend = api.organizer;
    this.textures = api.textures;
    this.pipelines = api.pipelines;
    this.attributes = api.attributes;
    this.nodes = api.nodes;
    this.info = api.statistics;
    this.updateMap = new WeakMap();
  }

  getForRender(renderObject: any) {
    const bindings = renderObject.getBindings();

    const data = this.get(renderObject);

    if (data.bindings !== bindings) {
      // each object defines an array of bindings (ubos, textures, samplers etc.)

      data.bindings = bindings;

      this._init(bindings);

      this.backend.createBindings(bindings);
    }

    return data.bindings;
  }

  getForCompute(computeNode: any) {
    const data = this.get(computeNode);

    if (data.bindings === undefined) {
      const nodeBuilder = this.nodes.getForCompute(computeNode);

      const bindings = nodeBuilder.getBindings();

      data.bindings = bindings;

      this._init(bindings);

      this.backend.createBindings(bindings);
    }

    return data.bindings;
  }

  updateForCompute(computeNode: any) {
    this._update(computeNode, this.getForCompute(computeNode));
  }

  updateForRender(renderObject: any) {
    this._update(renderObject, this.getForRender(renderObject));
  }

  _init(bindings: any[]) {
    for (const binding of bindings) {
      if (binding.type === 'sampler' || binding.isSampledTexture) {
        this.textures.updateTexture(binding.texture);
      } else if (binding.isStorageBuffer) {
        const attribute = binding.attribute;

        this.attributes.update(attribute, AttributeType.Storage);
      }
    }
  }

  _update(object: any, bindings: any[]) {
    const { backend } = this;

    const updateMap = this.updateMap;
    const frame = this.info.render.frame;

    let needsBindingsUpdate = false;

    // iterate over all bindings and check if buffer updates or a new binding group is required

    for (const binding of bindings) {
      const isShared = binding.isShared;
      const isUpdated = updateMap.get(binding) === frame;

      if (isShared && isUpdated) continue;

      if (binding.isUniformBuffer) {
        const needsUpdate = binding.update();

        if (needsUpdate) {
          backend.updateBinding(binding);
        }
      } else if (binding.isSampledTexture) {
        if (binding.needsBindingsUpdate) needsBindingsUpdate = true;

        const needsUpdate = binding.update();

        if (needsUpdate) {
          this.textures.updateTexture(binding.texture);
        }
      }

      updateMap.set(binding, frame);
    }

    if (needsBindingsUpdate) {
      const pipeline = this.pipelines.getForRender(object);

      this.backend.updateBindings(bindings);
    }
  }

  dispose() {
    this.map = new WeakMap();
    this.updateMap = new WeakMap();
  }

  get(object: object) {
    let item = this.map.get(object);

    if (!item) {
      item = {};
      this.map.set(object, item);
    }

    return item;
  }

  delete(object: object) {
    let item;

    if (this.map.has(object)) {
      item = this.map.get(object);

      this.map.delete(object);
    }

    return item;
  }

  has = (object: object) => this.map.has(object);
}

export default Bindings;
