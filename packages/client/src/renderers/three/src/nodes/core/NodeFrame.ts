import { NodeUpdateType } from './constants.js';
import Renderer from '../../common/Renderer.js';
import { Camera } from '../../cameras/Camera.js';
import { Object3D } from '../../core/Object3D.js';
import { Scene } from '../../scenes/Scene.js';
import { Material } from '../../materials/Material.js';
import { Node } from './Node.js';

export class NodeFrame {
  time: number;
  deltaTime: number;
  frameId: number;
  renderId: number;
  startTime: number | null;
  frameMap: WeakMap<any, any>;
  frameBeforeMap: WeakMap<any, any>;
  renderMap: WeakMap<any, any>;
  renderBeforeMap: WeakMap<any, any>;
  renderer: Renderer | null;
  material: Material | null;
  camera: Camera | null;
  object: Object3D | null;
  scene: Scene | null;
  lastTime: number | undefined;

  constructor() {
    this.time = 0;
    this.deltaTime = 0;

    this.frameId = 0;
    this.renderId = 0;

    this.startTime = null;

    this.frameMap = new WeakMap();
    this.frameBeforeMap = new WeakMap();
    this.renderMap = new WeakMap();
    this.renderBeforeMap = new WeakMap();

    this.renderer = null;
    this.material = null;
    this.camera = null;
    this.object = null;
    this.scene = null;
  }

  updateBeforeNode(node: Node) {
    const updateType = node.getUpdateBeforeType();

    if (updateType === NodeUpdateType.Frame) {
      if (this.frameBeforeMap.get(node) !== this.frameId) {
        this.frameBeforeMap.set(node, this.frameId);

        node.updateBefore(this);
      }
    } else if (updateType === NodeUpdateType.Render) {
      if (this.renderBeforeMap.get(node) !== this.renderId || this.frameBeforeMap.get(node) !== this.frameId) {
        this.renderBeforeMap.set(node, this.renderId);
        this.frameBeforeMap.set(node, this.frameId);

        node.updateBefore(this);
      }
    } else if (updateType === NodeUpdateType.Object) {
      node.updateBefore(this);
    }
  }

  updateNode(node: Node) {
    const updateType = node.getUpdateType();

    if (updateType === NodeUpdateType.Frame) {
      if (this.frameMap.get(node) !== this.frameId) {
        this.frameMap.set(node, this.frameId);

        node.update(this);
      }
    } else if (updateType === NodeUpdateType.Render) {
      if (this.renderMap.get(node) !== this.renderId || this.frameMap.get(node) !== this.frameId) {
        this.renderMap.set(node, this.renderId);
        this.frameMap.set(node, this.frameId);

        node.update(this);
      }
    } else if (updateType === NodeUpdateType.Object) {
      node.update(this);
    }
  }

  update() {
    this.frameId++;

    if (this.lastTime === undefined) this.lastTime = performance.now();

    this.deltaTime = (performance.now() - this.lastTime) / 1000;

    this.lastTime = performance.now();

    this.time += this.deltaTime;
  }
}

export default NodeFrame;
