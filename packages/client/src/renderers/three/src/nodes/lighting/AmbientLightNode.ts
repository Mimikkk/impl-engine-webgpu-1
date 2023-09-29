import AnalyticLightNode from './AnalyticLightNode.js';
import { addLightNode } from './LightsNode.js';

import { AmbientLight } from '../../Three.js';

class AmbientLightNode extends AnalyticLightNode {
  constructor(light = null) {
    super(light);
  }

  construct({ context }) {
    context.irradiance.addAssign(this.colorNode);
  }
}

export default AmbientLightNode;

addLightNode(AmbientLight, AmbientLightNode);
