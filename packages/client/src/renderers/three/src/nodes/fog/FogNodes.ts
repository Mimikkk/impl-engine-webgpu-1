import { FogExp2Node } from './FogExp2Node.js';
import { FogNode } from './FogNode.js';
import { FogRangeNode } from './FogRangeNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

export namespace FogNodes {
  export const density = nodeProxy(FogExp2Node);
  export const normal = nodeProxy(FogNode);
  export const range = nodeProxy(FogRangeNode);
}

addNodeElement('fog', FogNodes.normal);
addNodeElement('rangeFog', FogNodes.range);
addNodeElement('densityFog', FogNodes.density);
