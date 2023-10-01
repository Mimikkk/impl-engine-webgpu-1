import { SpotLightNode } from './SpotLightNode.js';
import { addLightNode } from './LightsNode.js';
import { texture } from '../accessors/TextureNode.js';
import { vec2 } from '../shadernode/ShaderNode.js';
import { IESSpotLight } from '../../lights/IESSpotLight.js';

export class IESSpotLightNode extends SpotLightNode {
  getSpotAttenuation(angleCosine: number) {
    //@ts-expect-error
    const iesMap = this.light.iesMap;

    let spotAttenuation = null;

    if (iesMap && iesMap.isTexture === true) {
      //@ts-expect-error
      const angle = angleCosine.acos().mul(1.0 / Math.PI);

      spotAttenuation = texture(iesMap, vec2(angle, 0), 0).r;
    } else {
      spotAttenuation = super.getSpotAttenuation(angleCosine);
    }

    return spotAttenuation;
  }
}

addLightNode(IESSpotLight, IESSpotLightNode);
