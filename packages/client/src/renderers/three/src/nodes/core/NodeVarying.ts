import { NodeVar } from './NodeVar.js';
import { NodeType } from './constants.js';

export class NodeVarying extends NodeVar {
  isNodeVarying: boolean = true;
  needsInterpolation: boolean;

  constructor(name: string, type: NodeType) {
    super(name, type);

    this.needsInterpolation = false;

    this.isNodeVarying = true;
  }
}
