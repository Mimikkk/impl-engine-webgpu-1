import { Node } from '../core/Node.js';
import { maxMipLevel } from './MaxMipLevelNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { TextureNode } from '../accessors/TextureNode.js';
import { NodeType } from '../core/constants.js';

export class SpecularMIPLevelNode extends Node {
  textureNode: TextureNode;
  roughnessNode: Node;

  constructor(textureNode: TextureNode, roughnessNode: Node) {
    super(NodeType.Float);

    this.textureNode = textureNode;
    this.roughnessNode = roughnessNode;
  }

  construct() {
    const { textureNode, roughnessNode } = this;

    const maxMIPLevelScalar = maxMipLevel(textureNode);

    const sigma = roughnessNode.mul(roughnessNode).mul(Math.PI).div(roughnessNode.add(1.0));
    const desiredMIPLevel = maxMIPLevelScalar.add(sigma.log2());

    return desiredMIPLevel.clamp(0.0, maxMIPLevelScalar);
  }
}

export const specularMIPLevel = nodeProxy(SpecularMIPLevelNode);
