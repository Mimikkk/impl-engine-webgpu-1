import { TextureNode } from './TextureNode.js';
import { UniformNode } from '../core/UniformNode.js';
import { reflectVector } from './ReflectVectorNode.js';
import { addNodeElement, nodeProxy, vec3 } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

import { UVNode } from './UVNode.js';
import { Node } from '../core/Node.js';

class CubeTextureNode extends TextureNode {
  isCubeTextureNode: boolean = true;

  constructor(value: any, uvNode: UVNode | null = null, levelNode: Node | null = null) {
    super(value, uvNode, levelNode);
  }

  getInputType(builder: NodeBuilder) {
    return 'cubeTexture';
  }

  getDefaultUV() {
    return reflectVector;
  }

  setUpdateMatrix(updateMatrix: boolean) {
    return this;
  }

  generate(builder: NodeBuilder, output: string | null) {
    const { uvNode, levelNode } = builder.getNodeProperties(this);

    const texture = this.value;

    if (!texture || texture.isCubeTexture !== true) {
      throw new Error('CubeTextureNode: Need a three.js cube texture.');
    }

    const textureProperty = UniformNode.prototype.generate.call(this, builder, 'cubeTexture');

    if (output === 'sampler') {
      return textureProperty + '_sampler';
    } else if (builder.isReference(output)) {
      return textureProperty;
    } else {
      const nodeData = builder.getDataFromNode(this);

      let propertyName = nodeData.propertyName;

      if (propertyName === undefined) {
        const cubeUV = vec3(uvNode.x.negate(), uvNode.yz);
        const uvSnippet = cubeUV.build(builder, 'vec3');

        const nodeVar = builder.getVarFromNode(this, 'vec4');

        propertyName = builder.getPropertyName(nodeVar);

        let snippet: any;

        if (levelNode?.isNode) {
          const levelSnippet = levelNode.build(builder, 'float');
          snippet = builder.getTextureLevel(this, textureProperty, uvSnippet, levelSnippet);
        } else {
          snippet = builder.getTexture(this, textureProperty, uvSnippet);
        }

        builder.addLineFlowCode(`${propertyName} = ${snippet}`);

        nodeData.snippet = snippet;
        nodeData.propertyName = propertyName;
      }

      return builder.format(propertyName, 'vec4', output);
    }
  }
}

export default CubeTextureNode;

export const cubeTexture = nodeProxy(CubeTextureNode);

addNodeElement('cubeTexture', cubeTexture);
