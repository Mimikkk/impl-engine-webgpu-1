import { AnalyticLightNode } from './AnalyticLightNode.js';
import { addLightNode } from './LightsNode.js';

import { AmbientLight } from '../../Three.js';

export class AmbientLightNode extends AnalyticLightNode {
  constructor(light: AmbientLight) {
    super(light);
  }

  construct({ context }: { context: any }) {
    context.irradiance.addAssign(this.colorNode);
  }
}

addLightNode(AmbientLight, AmbientLightNode);
