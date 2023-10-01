import { AnalyticLightNode } from './AnalyticLightNode.js';
import { addLightNode } from './LightsNode.js';
import { getDistanceAttenuation } from './LightUtils.js';
import { uniform } from '../core/UniformNode.js';
import { Object3DNodes } from '../accessors/Object3DNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';

import { PointLight } from '../../Three.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeFrame } from '../core/NodeFrame.js';

export class PointLightNode extends AnalyticLightNode {
  constructor(light = null) {
    super(light);

    this.cutoffDistanceNode = uniform(0);
    this.decayExponentNode = uniform(0);
  }

  update(frame: NodeFrame) {
    const { light } = this;

    super.update(frame);

    this.cutoffDistanceNode.value = light.distance;
    this.decayExponentNode.value = light.decay;
  }

  construct(builder: NodeBuilder) {
    const { colorNode, cutoffDistanceNode, decayExponentNode, light } = this;

    const lightingModel = builder.context.lightingModel;

    const lVector = Object3DNodes.viewPosition(light).sub(PositionNodes.view); // @TODO: Add it into LightNode

    const lightDirection = lVector.normalize();
    const lightDistance = lVector.length();

    const lightAttenuation = getDistanceAttenuation({
      lightDistance,
      cutoffDistance: cutoffDistanceNode,
      decayExponent: decayExponentNode,
    });

    const lightColor = colorNode.mul(lightAttenuation);

    const reflectedLight = builder.context.reflectedLight;

    lightingModel.direct({
      lightDirection,
      lightColor,
      reflectedLight,
    });
  }
}

addLightNode(PointLight, PointLightNode);
