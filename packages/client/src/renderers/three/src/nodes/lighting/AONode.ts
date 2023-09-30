import LightingNode from './LightingNode.js';

class AONode extends LightingNode {
  constructor(aoNode = null) {
    super();

    this.aoNode = aoNode;
  }

  construct(builder: NodeBuilder) {
    const aoIntensity = 1;
    const aoNode = this.aoNode.x.sub(1.0).mul(aoIntensity).add(1.0);

    builder.context.ambientOcclusion.mulAssign(aoNode);
  }
}

export default AONode;
