import { AnalyticLightNode } from './AnalyticLightNode.js';
import { lightTargetDirection } from './LightNode.js';
import { addLightNode } from './LightsNode.js';
import { getDistanceAttenuation } from './LightUtils.js';
import { uniform } from '../core/UniformNode.js';
import { smoothstep } from '../math/MathNode.js';
import { Object3DNodes } from '../accessors/Object3DNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { SpotLight } from '../../Three.js';
import { NodeFrame } from '../core/NodeFrame.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { Node } from '../core/Node.js';

export class SpotLightNode extends AnalyticLightNode {
  coneCosNode: Node;
  penumbraCosNode: Node;
  cutoffDistanceNode: Node;
  decayExponentNode: Node;

  constructor(light: SpotLight) {
    super(light);

    this.coneCosNode = uniform(0);
    this.penumbraCosNode = uniform(0);
    this.cutoffDistanceNode = uniform(0);
    this.decayExponentNode = uniform(0);
  }

  update(frame: NodeFrame) {
    super.update(frame);
    const light = this.light as SpotLight;

    //@ts-expect-error
    this.coneCosNode.value = Math.cos(light.angle);
    //@ts-expect-error
    this.penumbraCosNode.value = Math.cos(light.angle * (1 - light.penumbra));

    //@ts-expect-error
    this.cutoffDistanceNode.value = light.distance;
    //@ts-expect-error
    this.decayExponentNode.value = light.decay;
  }

  getSpotAttenuation(angleCosine: number) {
    const { coneCosNode, penumbraCosNode } = this;

    return smoothstep(coneCosNode, penumbraCosNode, angleCosine);
  }

  construct(builder: NodeBuilder) {
    super.construct(builder);

    const lightingModel = builder.context.lightingModel;

    const { colorNode, cutoffDistanceNode, decayExponentNode, light } = this;

    const lVector = Object3DNodes.viewPosition(light).sub(PositionNodes.view); // @TODO: Add it into LightNode

    const lightDirection = lVector.normalize();
    const angleCos = lightDirection.dot(lightTargetDirection(light));
    const spotAttenuation = this.getSpotAttenuation(angleCos);

    const lightDistance = lVector.length();

    const lightAttenuation = getDistanceAttenuation({
      lightDistance,
      cutoffDistance: cutoffDistanceNode,
      decayExponent: decayExponentNode,
    });

    //@ts-expect-error
    const lightColor = colorNode.mul(spotAttenuation).mul(lightAttenuation);

    const reflectedLight = builder.context.reflectedLight;

    lightingModel.direct({ lightDirection, lightColor, reflectedLight });
  }
}

addLightNode(SpotLight, SpotLightNode);
