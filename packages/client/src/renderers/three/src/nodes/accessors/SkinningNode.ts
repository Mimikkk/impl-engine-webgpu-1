import { Node } from '../core/Node.js';
import { NodeType, NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { attribute } from '../core/AttributeNode.js';
import { uniform } from '../core/UniformNode.js';
import { add } from '../math/OperatorNode.js';
import { buffer } from './BufferNode.js';
import { NormalNodes } from './NormalNode.js';
import { PositionNodes } from './PositionNode.js';
import { TangentNodes } from './TangentNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { SkinnedMesh } from '../../objects/SkinnedMesh.js';

export class SkinningNode extends Node {
  skinnedMesh: SkinnedMesh;
  skinIndexNode: Node;
  skinWeightNode: Node;
  bindMatrixNode: Node;
  bindMatrixInverseNode: Node;
  boneMatricesNode: Node;

  constructor(skinnedMesh: SkinnedMesh) {
    super(NodeType.Void);
    this.skinnedMesh = skinnedMesh;
    this.updateType = NodeUpdateType.Object;
    this.skinIndexNode = attribute('skinIndex', NodeType.UnsignedVector4);
    this.skinWeightNode = attribute('skinWeight', NodeType.Vector4);
    this.bindMatrixNode = uniform(skinnedMesh.bindMatrix, NodeType.Matrix4);
    this.bindMatrixInverseNode = uniform(skinnedMesh.bindMatrixInverse, NodeType.Matrix4);
    this.boneMatricesNode = buffer(
      skinnedMesh.skeleton.boneMatrices,
      NodeType.Matrix4,
      skinnedMesh.skeleton.bones.length,
    );
  }

  construct(builder: NodeBuilder) {
    const { skinIndexNode, skinWeightNode, bindMatrixNode, bindMatrixInverseNode, boneMatricesNode } = this;

    const boneMatX = boneMatricesNode.element(skinIndexNode.x);
    const boneMatY = boneMatricesNode.element(skinIndexNode.y);
    const boneMatZ = boneMatricesNode.element(skinIndexNode.z);
    const boneMatW = boneMatricesNode.element(skinIndexNode.w);

    // POSITION

    const skinVertex = bindMatrixNode.mul(PositionNodes.local);

    const skinned = add(
      boneMatX.mul(skinWeightNode.x).mul(skinVertex),
      boneMatY.mul(skinWeightNode.y).mul(skinVertex),
      boneMatZ.mul(skinWeightNode.z).mul(skinVertex),
      boneMatW.mul(skinWeightNode.w).mul(skinVertex),
    );

    const skinPosition = bindMatrixInverseNode.mul(skinned).xyz;

    // NORMAL

    let skinMatrix = add(
      skinWeightNode.x.mul(boneMatX),
      skinWeightNode.y.mul(boneMatY),
      skinWeightNode.z.mul(boneMatZ),
      skinWeightNode.w.mul(boneMatW),
    );

    skinMatrix = bindMatrixInverseNode.mul(skinMatrix).mul(bindMatrixNode);
    const skinNormal = skinMatrix.transformDirection(NormalNodes.local).xyz;

    builder.stack.assign(PositionNodes.local, skinPosition);
    builder.stack.assign(NormalNodes.local, skinNormal);
    if (builder.hasGeometryAttribute('tangent')) builder.stack.assign(TangentNodes.local, skinNormal);
  }

  update() {
    this.skinnedMesh.skeleton.update();
  }
}

export const skinning = nodeProxy(SkinningNode);
