import { NodeType } from './constants.js';

export class NodeVar {
  isNodeVar: boolean = true;
  name: string;
  type: NodeType;

  constructor(name: string, type: NodeType) {
    this.isNodeVar = true;

    this.name = name;
    this.type = type;
  }
}
