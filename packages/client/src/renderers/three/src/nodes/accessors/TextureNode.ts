import UniformNode, { uniform } from '../core/UniformNode.js';
import { uv, UVNode } from './UVNode.js';
import { textureSize } from './TextureSizeNode.js';
import { ColorSpaceNodes } from '../display/ColorSpaceNode.js';
import { context } from '../core/ContextNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addNodeElement, nodeObject, nodeProxy, vec3 } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { Node } from '../core/Node.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { Texture } from '../../textures/Texture.js';
import { DepthTexture } from '../../textures/DepthTexture.js';

export class TextureNode extends UniformNode {
  isTextureNode: boolean = true;
  uvNode: UVNode | null = null;
  levelNode: Node | null = null;
  compareNode: Node | null = null;
  updateMatrix: boolean = false;
  updateType: NodeUpdateType = NodeUpdateType.None;
  declare value: Texture;

  constructor(
    value: Texture,
    uvNode: UVNode | null = null,
    levelNode: Node | null = null,
    compareNode: Node | null = null,
  ) {
    super(value);

    this.uvNode = uvNode;
    this.levelNode = levelNode;
    this.compareNode = compareNode;

    this.setUpdateMatrix(uvNode === null);
  }

  getUniformHash(builder: NodeBuilder) {
    return this.value.uuid;
  }

  getNodeType(builder: NodeBuilder) {
    if (DepthTexture.is(this.value)) return 'float';

    return 'vec4';
  }

  getInputType(builder: NodeBuilder) {
    return 'texture';
  }

  getDefaultUV() {
    return uv(this.value.channel);
  }

  getTextureMatrix(uvNode: UVNode) {
    const texture = this.value;

    return uniform(texture.matrix).mul(vec3(uvNode, 1)).xy;
  }

  setUpdateMatrix(value: boolean) {
    this.updateMatrix = value;
    this.updateType = value ? NodeUpdateType.Frame : NodeUpdateType.None;

    return this;
  }

  construct(builder: NodeBuilder) {
    const properties = builder.getNodeProperties(this);

    let uvNode = this.uvNode;
    if (uvNode === null && builder.context.getUVNode) {
      uvNode = builder.context.getUVNode(this);
    }
    if (!uvNode) uvNode = this.getDefaultUV();
    if (this.updateMatrix) {
      uvNode = this.getTextureMatrix(uvNode!);
    }
    let levelNode = this.levelNode;
    if (levelNode === null && builder.context.getSamplerLevelNode) {
      levelNode = builder.context.getSamplerLevelNode(this);
    }

    properties.uvNode = uvNode;
    properties.levelNode = levelNode ? builder.context.getMIPLevelAlgorithmNode(this, levelNode) : null;
  }

  generate(builder: NodeBuilder, output: string | null) {
    const { uvNode, levelNode } = builder.getNodeProperties(this);

    const compareNode = this.compareNode;
    const texture = this.value;

    if (!texture || texture.isTexture !== true) {
      throw new Error('TextureNode: Need a three.js texture.');
    }

    const textureProperty = super.generate(builder, 'property');

    if (output === 'sampler') {
      return textureProperty + '_sampler';
    } else if (builder.isReference(output)) {
      return textureProperty;
    } else {
      const nodeType = this.getNodeType(builder);
      const nodeData = builder.getDataFromNode(this);

      let propertyName = nodeData.propertyName;

      if (propertyName === undefined) {
        const uvSnippet = uvNode.build(builder, 'vec2');
        const nodeVar = builder.getVarFromNode(this, nodeType);

        propertyName = builder.getPropertyName(nodeVar);

        let snippet = null;

        if (levelNode && levelNode.isNode === true) {
          const levelSnippet = levelNode.build(builder, 'float');

          snippet = builder.getTextureLevel(texture, textureProperty, uvSnippet, levelSnippet);
        } else if (compareNode !== null) {
          const compareSnippet = compareNode.build(builder, 'float');

          //@ts-expect-error
          snippet = builder.getTextureCompare(texture, textureProperty, uvSnippet, compareSnippet);
        } else {
          snippet = builder.getTexture(texture, textureProperty, uvSnippet);
        }

        builder.addLineFlowCode(`${propertyName} = ${snippet}`);

        nodeData.snippet = snippet;
        nodeData.propertyName = propertyName;
      }

      let snippet = propertyName;

      if (builder.needsColorSpaceToLinear(this.value)) {
        snippet = ColorSpaceNodes.colorSpaceToLinear(expression(snippet, nodeType), this.value.colorSpace)
          .construct(builder)
          .build(builder, nodeType);
      }

      return builder.format(snippet, nodeType, output);
    }
  }

  uv(uvNode: UVNode) {
    const textureNode = this.clone();
    textureNode.uvNode = uvNode;

    return nodeObject(textureNode);
  }

  level(levelNode: Node) {
    const textureNode = this.clone();
    textureNode.levelNode = levelNode;

    return context(textureNode, {
      getMIPLevelAlgorithmNode: (textureNode: TextureNode, levelNode: Node) => levelNode,
    });
  }

  size(levelNode: Node) {
    return textureSize(this, levelNode);
  }

  compare(compareNode: Node) {
    const textureNode = this.clone();
    textureNode.compareNode = nodeObject(compareNode);

    return nodeObject(textureNode);
  }

  update() {
    const texture = this.value;

    if (texture.matrixAutoUpdate === true) {
      texture.updateMatrix();
    }
  }

  clone() {
    //@ts-expect-error
    return new this.constructor(this.value, this.uvNode, this.levelNode, this.compareNode);
  }
}

export const texture = nodeProxy(TextureNode);
export const textureLevel = (value: any, uv: UVNode, level: Node) => texture(value, uv).level(level);

export const sampler = (aTexture: Node) => (aTexture.isNode === true ? aTexture : texture(aTexture)).convert('sampler');

addNodeElement('texture', texture);
//@ts-expect-error
addNodeElement('textureLevel', textureLevel);
