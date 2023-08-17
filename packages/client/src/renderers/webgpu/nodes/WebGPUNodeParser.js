import NodeParser from 'three/examples/jsm/nodes/core/NodeParser.js';
import WebGPUNodeFunction from './WebGPUNodeFunction.js';

class WebGPUNodeParser extends NodeParser {
  parseFunction = source => new WebGPUNodeFunction(source);
}

export default WebGPUNodeParser;
