import { LightingNode } from './LightingNode.js';
import { cache } from '../core/CacheNode.js';
import { context } from '../core/ContextNode.js';
import { PropertyNodes } from '../core/PropertyNode.js';
import { equirectUV } from '../utils/EquirectUVNode.js';
import { specularMIPLevel } from '../utils/SpecularMIPLevelNode.js';
import { CameraNodes } from '../accessors/CameraNode.js';
import { NormalNodes } from '../accessors/NormalNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { float, vec2 } from '../shadernode/ShaderNode.js';
import { cubeTexture } from '../accessors/CubeTextureNode.js';
import { reference } from '../accessors/ReferenceNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { Node } from '../core/Node.js';
import { TextureNode } from '../accessors/TextureNode.js';
import { NodeType } from '../core/constants.js';
import { UVNode } from '../accessors/UVNode.js';

const envNodeCache = new WeakMap();

export class EnvironmentNode extends LightingNode {
  envNode: Node;

  constructor(envNode: Node) {
    super();

    this.envNode = envNode;
  }

  construct(builder: NodeBuilder) {
    let envNode = this.envNode;
    const properties = builder.getNodeProperties(this);

    //@ts-expect-error
    if (envNode.isTextureNode && envNode.value.isCubeTexture !== true) {
      //@ts-expect-error
      let cacheEnvNode = envNodeCache.get(envNode.value);

      if (cacheEnvNode === undefined) {
        //@ts-expect-error
        const texture = envNode.value;
        const renderer = builder.renderer;

        //@ts-expect-error
        const cubeRTT = builder.getCubeRenderTarget(512).fromEquirectangularTexture(renderer, texture);

        cacheEnvNode = cubeTexture(cubeRTT.texture);
        //@ts-expect-error
        envNodeCache.set(envNode.value, cacheEnvNode);
      }

      envNode = cacheEnvNode;
    }

    const intensity = reference('envMapIntensity', NodeType.Float, builder.material);

    const radiance = context(envNode, createRadianceContext(PropertyNodes.roughness, NormalNodes.transformed.view)).mul(
      intensity,
    );
    const irradiance = context(envNode, createIrradianceContext(NormalNodes.transformed.world))
      .mul(Math.PI)
      .mul(intensity);

    const isolateRadiance = cache(radiance);

    //

    builder.context.radiance.addAssign(isolateRadiance);

    builder.context.iblIrradiance.addAssign(irradiance);

    //

    const clearcoatRadiance = builder.context.lightingModel.clearcoatRadiance;

    if (clearcoatRadiance) {
      const clearcoatRadianceContext = context(
        envNode,
        createRadianceContext(PropertyNodes.clearcoatRoughness, NormalNodes.transformed.clearcoat),
      ).mul(intensity);
      const isolateClearcoatRadiance = cache(clearcoatRadianceContext);

      clearcoatRadiance.addAssign(isolateClearcoatRadiance);
    }

    //

    properties.radiance = isolateRadiance;
    properties.irradiance = irradiance;
  }
}

const createRadianceContext = (roughnessNode: Node, normalViewNode: Node) => {
  let reflectVec: Node | null = null;
  let textureUVNode: UVNode | null = null;

  return {
    getUVNode: (textureNode: TextureNode) => {
      let node = null;

      if (reflectVec === null) {
        reflectVec = PositionNodes.directional.view.negate().reflect(normalViewNode);
        //@ts-expect-error
        reflectVec = roughnessNode.mul(roughnessNode).mix(reflectVec, normalViewNode).normalize();
        //@ts-expect-error
        reflectVec = reflectVec!.transformDirection(CameraNodes.matrix.view);
      }

      if ('isCubeTextureNode' in textureNode) {
        node = reflectVec;
      } else if (textureNode.isTextureNode) {
        if (textureUVNode === null) {
          // @TODO: Needed PMREM

          textureUVNode = equirectUV(reflectVec);
        }

        node = textureUVNode;
      }

      return node;
    },
    getSamplerLevelNode: () => roughnessNode,
    getMIPLevelAlgorithmNode: (textureNode: TextureNode, levelNode: Node) => specularMIPLevel(textureNode, levelNode),
  };
};

const createIrradianceContext = (normalWorldNode: Node) => {
  let textureUVNode: UVNode | null = null;

  return {
    getUVNode: (textureNode: TextureNode) => {
      let node: UVNode | null = null;

      if ('isCubeTextureNode' in textureNode) {
        node = normalWorldNode as UVNode;
      } else if (textureNode.isTextureNode) {
        if (textureUVNode === null) {
          textureUVNode = equirectUV(normalWorldNode);
          //@ts-expect-error
          textureUVNode = vec2(textureUVNode!.x, textureUVNode!.y.oneMinus());
        }
        node = textureUVNode;
      }

      return node;
    },
    getSamplerLevelNode: () => float(1),
    getMIPLevelAlgorithmNode: (textureNode: TextureNode, levelNode: Node) => specularMIPLevel(textureNode, levelNode),
  };
};
