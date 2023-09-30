import LightingNode from './LightingNode.js';
import { cache } from '../core/CacheNode.js';
import { context } from '../core/ContextNode.js';
import { clearcoatRoughness, roughness } from '../core/PropertyNode.js';
import { equirectUV } from '../utils/EquirectUVNode.js';
import { specularMIPLevel } from '../utils/SpecularMIPLevelNode.js';
import { CameraNodes } from '../accessors/CameraNode.js';
import { NormalNodes } from '../accessors/NormalNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { float, vec2 } from '../shadernode/ShaderNode.js';
import { cubeTexture } from '../accessors/CubeTextureNode.js';
import { reference } from '../accessors/ReferenceNode.js';

const envNodeCache = new WeakMap();

class EnvironmentNode extends LightingNode {
  constructor(envNode = null) {
    super();

    this.envNode = envNode;
  }

  construct(builder: NodeBuilder) {
    let envNode = this.envNode;
    const properties = builder.getNodeProperties(this);

    if (envNode.isTextureNode && envNode.value.isCubeTexture !== true) {
      let cacheEnvNode = envNodeCache.get(envNode.value);

      if (cacheEnvNode === undefined) {
        const texture = envNode.value;
        const renderer = builder.renderer;

        // @TODO: Add dispose logic here
        const cubeRTT = builder.getCubeRenderTarget(512).fromEquirectangularTexture(renderer, texture);

        cacheEnvNode = cubeTexture(cubeRTT.texture);

        envNodeCache.set(envNode.value, cacheEnvNode);
      }

      envNode = cacheEnvNode;
    }

    //

    const intensity = reference('envMapIntensity', 'float', builder.material); // @TODO: Add materialEnvIntensity in MaterialNode

    const radiance = context(envNode, createRadianceContext(roughness, NormalNodes.transformed.view)).mul(intensity);
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
        createRadianceContext(clearcoatRoughness, NormalNodes.transformed.clearcoat),
      ).mul(intensity);
      const isolateClearcoatRadiance = cache(clearcoatRadianceContext);

      clearcoatRadiance.addAssign(isolateClearcoatRadiance);
    }

    //

    properties.radiance = isolateRadiance;
    properties.irradiance = irradiance;
  }
}

const createRadianceContext = (roughnessNode, normalViewNode) => {
  let reflectVec = null;
  let textureUVNode = null;

  return {
    getUVNode: textureNode => {
      let node = null;

      if (reflectVec === null) {
        reflectVec = PositionNodes.directional.view.negate().reflect(normalViewNode);
        reflectVec = roughnessNode.mul(roughnessNode).mix(reflectVec, normalViewNode).normalize();
        reflectVec = reflectVec.transformDirection(CameraNodes.matrix.view);
      }

      if (textureNode.isCubeTextureNode) {
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
    getSamplerLevelNode: () => {
      return roughnessNode;
    },
    getMIPLevelAlgorithmNode: (textureNode, levelNode) => {
      return specularMIPLevel(textureNode, levelNode);
    },
  };
};

const createIrradianceContext = normalWorldNode => {
  let textureUVNode = null;

  return {
    getUVNode: textureNode => {
      let node = null;

      if (textureNode.isCubeTextureNode) {
        node = normalWorldNode;
      } else if (textureNode.isTextureNode) {
        if (textureUVNode === null) {
          // @TODO: Needed PMREM

          textureUVNode = equirectUV(normalWorldNode);
          textureUVNode = vec2(textureUVNode.x, textureUVNode.y.oneMinus());
        }

        node = textureUVNode;
      }

      return node;
    },
    getSamplerLevelNode: () => {
      return float(1);
    },
    getMIPLevelAlgorithmNode: (textureNode, levelNode) => {
      return specularMIPLevel(textureNode, levelNode);
    },
  };
};

export default EnvironmentNode;
