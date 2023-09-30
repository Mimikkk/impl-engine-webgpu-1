import { TempNode } from '../core/TempNode.js';
import { addNodeElement, nodeArray, nodeObject, nodeObjects } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { FunctionNode } from './FunctionNode.js';

export class FunctionCallNode extends TempNode {
  functionNode: FunctionNode;
  parameters: {};

  constructor(functionNode: FunctionNode, parameters: {} = {}) {
    super();

    this.functionNode = functionNode;
    this.parameters = parameters;
  }

  setParameters(parameters: {}) {
    this.parameters = parameters;

    return this;
  }

  getParameters() {
    return this.parameters;
  }

  getNodeType(builder: NodeBuilder) {
    return this.functionNode!.getNodeType(builder);
  }

  generate(builder: NodeBuilder) {
    const params = [];

    const functionNode = this.functionNode;

    const inputs = functionNode.getInputs(builder);
    const parameters = this.parameters;

    if (Array.isArray(parameters)) {
      for (let i = 0; i < parameters.length; i++) {
        const inputNode = inputs[i];
        const node = parameters[i];

        params.push(node.build(builder, inputNode.type));
      }
    } else {
      for (const inputNode of inputs) {
        const node = parameters[inputNode.name];

        if (node) {
          params.push(node.build(builder, inputNode.type));
        } else {
          throw new Error(`FunctionCallNode: Input '${inputNode.name}' not found in FunctionNode.`);
        }
      }
    }

    const functionName = functionNode.build(builder, 'property');

    return `${functionName}( ${params.join(', ')} )`;
  }
}

export const call = (func: any, ...params: any[]) => {
  params = params[0]?.isNode ? nodeArray(params) : nodeObjects(params[0]);

  return nodeObject(new FunctionCallNode(nodeObject(func), params));
};

addNodeElement('call', call);
