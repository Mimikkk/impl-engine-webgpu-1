import { Node } from '../core/Node.js';
import { AnalyticLightNode } from './AnalyticLightNode.js';
import { nodeObject, nodeProxy } from '../shadernode/ShaderNode.js';
import { LightNode } from './LightNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { Light } from '../../lights/Light.js';
import { NodeType } from '../core/constants.js';

const LightNodes = new WeakMap();

const sortLights = (lights: Light[]) => {
  return lights.sort((a, b) => a.id - b.id);
};

export class LightsNode extends Node {
  lightNodes: LightNode[];
  _hash: string | null;

  constructor(lightNodes: LightNode[] = []) {
    super(NodeType.Vector3);
    this.lightNodes = lightNodes;
    this._hash = null;
  }

  get hasLight() {
    return this.lightNodes.length > 0;
  }

  construct(builder: NodeBuilder) {
    const lightNodes = this.lightNodes;

    for (const lightNode of lightNodes) {
      lightNode.build(builder);
    }
  }

  getHash(builder: NodeBuilder) {
    if (this._hash === null) {
      let hash = '';

      const lightNodes = this.lightNodes;

      for (const lightNode of lightNodes) {
        hash += lightNode.getHash(builder) + ' ';
      }

      this._hash = hash;
    }

    return this._hash;
  }

  getLightNodeByHash(hash: string) {
    return this.lightNodes.find(lightNode => lightNode.light.uuid === hash);
  }

  fromLights(lights: Light[] = []) {
    const lightNodes: LightNode[] = [];

    lights = sortLights(lights);

    for (const light of lights) {
      let lightNode = this.getLightNodeByHash(light.uuid);

      if (lightNode === null) {
        const lightClass = light.constructor;
        const lightNodeClass = LightNodes.has(lightClass) ? LightNodes.get(lightClass) : AnalyticLightNode;

        lightNode = nodeObject(new lightNodeClass(light));
      }

      lightNodes.push(lightNode!);
    }

    this.lightNodes = lightNodes;
    this._hash = null;

    return this;
  }
}

export const lights = (lights: Light[]) => nodeObject(new LightsNode().fromLights(lights));
export const lightsWithoutWrap = nodeProxy(LightsNode);

export function addLightNode(lightClass: any, lightNodeClass: any) {
  LightNodes.set(lightClass, lightNodeClass);
}
