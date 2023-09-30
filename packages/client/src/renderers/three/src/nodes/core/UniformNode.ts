import { InputNode } from './InputNode.js';
import { getConstNodeType, nodeObject } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from './NodeBuilder.js';

class UniformNode extends InputNode {
  isUniformNode: boolean;

  constructor(value: any, nodeType = null) {
    super(value, nodeType);
    this.isUniformNode = true;
  }

  getUniformHash(builder: NodeBuilder) {
    return this.getHash(builder);
  }

  generate(builder: NodeBuilder, output: string | null) {
    const type = this.getNodeType(builder);

    const hash = this.getUniformHash(builder);

    let sharedNode = builder.getNodeFromHash(hash);

    if (sharedNode === undefined) {
      builder.setHashNode(this, hash);

      sharedNode = this;
    }

    const sharedNodeType = sharedNode.getInputType(builder);

    const nodeUniform = builder.getUniformFromNode(
      sharedNode,
      sharedNodeType,
      builder.shaderStage,
      builder.context.label,
    );
    const propertyName = builder.getPropertyName(nodeUniform);

    return builder.format(propertyName, type, output);
  }
}

export default UniformNode;

export const uniform = (arg1: any, arg2: any) => {
  const nodeType = getConstNodeType(arg2 || arg1);

  const value = arg1 && arg1.isNode ? (arg1.node && arg1.node.value) || arg1.value : arg1;

  return nodeObject(new UniformNode(value, nodeType));
};
