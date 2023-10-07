import { Node } from '../core/Node.js';
import { add } from '../math/OperatorNode.js';
import { NormalNode, NormalNodes } from '../accessors/NormalNode.js';
import { PositionNode, PositionNodes } from '../accessors/PositionNode.js';
import { texture } from '../accessors/TextureNode.js';
import { addNodeElement, float, nodeProxy, vec3 } from '../shadernode/ShaderNode.js';
import { NodeType } from '../core/constants.js';

export class TriplanarTexturesNode extends Node {
  textureXNode: Node;
  textureYNode: Node | null;
  textureZNode: Node | null;
  scaleNode: Node;
  positionNode: PositionNode;
  normalNode: NormalNode;

  constructor(
    textureXNode: Node,
    textureYNode: Node | null = null,
    textureZNode: Node | null = null,
    scaleNode: Node = float(1),
    positionNode: PositionNode = PositionNodes.world,
    normalNode: NormalNode = NormalNodes.world,
  ) {
    super(NodeType.Vector4);
    this.textureXNode = textureXNode;
    this.textureYNode = textureYNode;
    this.textureZNode = textureZNode;
    this.scaleNode = scaleNode;
    this.positionNode = positionNode;
    this.normalNode = normalNode;
  }

  construct() {
    const { textureXNode, textureYNode, textureZNode, scaleNode, positionNode, normalNode } = this;

    let bf = normalNode.abs().normalize();
    bf = bf.div(bf.dot(vec3(1.0)));

    const textureX = textureXNode.value;
    const textureY = textureYNode?.value ?? textureX;
    const textureZ = textureZNode?.value ?? textureX;

    return add(
      texture(textureXNode.value, positionNode.yz.mul(scaleNode)).mul(bf.x),
      texture(textureY, positionNode.zx.mul(scaleNode)).mul(bf.y),
      texture(textureZ, positionNode.xy.mul(scaleNode)).mul(bf.z),
    );
  }
}

export const triplanarTextures = nodeProxy(TriplanarTexturesNode);
export const triplanarTexture = (...params: any[]) => triplanarTextures(...params);

addNodeElement('triplanarTexture', triplanarTexture);
