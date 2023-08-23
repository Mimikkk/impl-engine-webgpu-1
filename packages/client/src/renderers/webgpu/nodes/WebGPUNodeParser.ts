import WebGPUNodeFunction from './WebGPUNodeFunction.js';

class WebGPUNodeParser {
  parseFunction = (source: string) => new WebGPUNodeFunction(source);
}

export default WebGPUNodeParser;
