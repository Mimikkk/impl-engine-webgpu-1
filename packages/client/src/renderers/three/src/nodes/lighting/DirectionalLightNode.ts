import { AnalyticLightNode } from './AnalyticLightNode.js';
import { lightTargetDirection } from './LightNode.js';
import { addLightNode } from './LightsNode.js';
import { DirectionalLight } from '../../Three.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

export class DirectionalLightNode extends AnalyticLightNode {
  constructor(light: DirectionalLight) {
    super(light);
  }

  construct(builder: NodeBuilder) {
    super.construct(builder);

    const lightingModel = builder.context.lightingModel;
    const lightColor = this.colorNode;
    const lightDirection = lightTargetDirection(this.light);
    const reflectedLight = builder.context.reflectedLight;

    lightingModel.direct({ lightDirection, lightColor, reflectedLight });
  }
}

addLightNode(DirectionalLight, DirectionalLightNode);
