import NodeParser from './core/NodeParser.js';
import WebGPUNodeFunction from './WebGPUNodeFunction.js';

class WebGPUNodeParser extends NodeParser {
  parseFunction = source => new WebGPUNodeFunction(source);
}

export default WebGPUNodeParser;
