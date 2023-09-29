import AnalyticLightNode from './AnalyticLightNode.js';
import { lightTargetDirection } from './LightNode.js';
import { addLightNode } from './LightsNode.js';

import { DirectionalLight } from '../../Three.js';

class DirectionalLightNode extends AnalyticLightNode {
  constructor(light = null) {
    super(light);
  }

  construct(builder) {
    super.construct(builder);

    const lightingModel = builder.context.lightingModel;

    const lightColor = this.colorNode;
    const lightDirection = lightTargetDirection(this.light);
    const reflectedLight = builder.context.reflectedLight;

    lightingModel.direct({
      lightDirection,
      lightColor,
      reflectedLight,
    });
  }
}

export default DirectionalLightNode;

addLightNode(DirectionalLight, DirectionalLightNode);
