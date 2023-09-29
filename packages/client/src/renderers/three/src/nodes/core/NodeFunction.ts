import { NodeType } from './constants.js';
import { NodeFunctionInput } from '../Nodes.js';

export abstract class NodeFunction {
  type: NodeType | string;
  inputs: NodeFunctionInput[];
  name: string;
  precision: string;

  protected constructor(
    type: NodeType | string,
    inputs: NodeFunctionInput[],
    name: string = '',
    precision: string = '',
  ) {
    this.type = type;
    this.inputs = inputs;
    this.name = name;
    this.precision = precision;
  }

  abstract getCode(name: string): string;
}
