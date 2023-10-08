import { AnalyticLightNode } from './AnalyticLightNode.js';
import { addLightNode } from './LightsNode.js';
import { uniform } from '../core/UniformNode.js';
import { mix } from '../math/MathNode.js';
import { NormalNodes } from '../accessors/NormalNode.js';
import { Object3DNodes } from '../accessors/Object3DNode.js';

import { Color, HemisphereLight } from '../../Three.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeFrame } from '../core/NodeFrame.js';
import { Object3DNode } from '../accessors/Object3DNode.js';
import { Node } from '../core/Node.js';

export class HemisphereLightNode extends AnalyticLightNode {
  lightPositionNode: Object3DNode;
  lightDirectionNode: Node;
  groundColorNode: Node;

  constructor(light: HemisphereLight) {
    super(light);

    this.lightPositionNode = Object3DNodes.position(light);
    //@ts-expect-error
    this.lightDirectionNode = this.lightPositionNode.normalize();

    this.groundColorNode = uniform(new Color());
  }

  update(frame: NodeFrame) {
    const { light } = this;

    super.update(frame);

    //@ts-expect-error
    this.lightPositionNode.object3d = light;

    //@ts-expect-error
    this.groundColorNode.value.copy(light.groundColor).multiplyScalar(light.intensity);
  }

  construct(builder: NodeBuilder) {
    const { colorNode, groundColorNode, lightDirectionNode } = this;

    const dotNL = NormalNodes.view.dot(lightDirectionNode);
    const hemiDiffuseWeight = dotNL.mul(0.5).add(0.5);

    const irradiance = mix(groundColorNode, colorNode, hemiDiffuseWeight);

    builder.context.irradiance.addAssign(irradiance);
  }
}

addLightNode(HemisphereLight, HemisphereLightNode);
