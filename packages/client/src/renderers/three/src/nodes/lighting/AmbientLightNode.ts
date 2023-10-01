import { AnalyticLightNode } from './AnalyticLightNode.js';
import { addLightNode } from './LightsNode.js';

import { AmbientLight } from '../../Three.js';

export class AmbientLightNode extends AnalyticLightNode {
  constructor(light = null) {
    console.log('hh');
    super(light);
  }

  construct({ context }) {
    context.irradiance.addAssign(this.colorNode);
  }
}

addLightNode(AmbientLight, AmbientLightNode);
