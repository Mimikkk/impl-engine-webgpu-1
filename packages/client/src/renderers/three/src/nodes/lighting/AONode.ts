import { LightingNode } from './LightingNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { Node } from '../core/Node.js';

export class AONode extends LightingNode {
  aoNode: Node;

  constructor(aoNode: Node) {
    super();
    this.aoNode = aoNode;
  }

  construct(builder: NodeBuilder) {
    const aoIntensity = 1;
    const aoNode = this.aoNode.x.sub(1.0).mul(aoIntensity).add(1.0);

    builder.context.ambientOcclusion.mulAssign(aoNode);
  }
}
