import {
  GLSLVersion,
  LinearSRGBColorSpace,
  Material,
  NoColorSpace,
  ShaderMaterial,
  UniformsGroup,
} from '../../Three.js';
import { getCacheKey } from '../core/NodeUtils.js';
import { attribute } from '../core/AttributeNode.js';
import { PropertyNodes } from '../core/PropertyNode.js';
import { ExtendedMaterialNodes } from '../accessors/ExtendedMaterialNode.js';
import { MaterialNode, MaterialNodes } from '../accessors/MaterialNode.js';
import { modelViewProjection } from '../accessors/ModelViewProjectionNode.js';
import { NormalNodes } from '../accessors/NormalNode.js';
import { instance } from '../accessors/InstanceNode.js';
import { PositionNodes } from '../accessors/PositionNode.js';
import { skinning } from '../accessors/SkinningNode.js';
import { morph } from '../accessors/MorphNode.js';
import { texture } from '../accessors/TextureNode.js';
import { cubeTexture } from '../accessors/CubeTextureNode.js';
import { lightsWithoutWrap } from '../lighting/LightsNode.js';
import { dFdx, dFdy, mix } from '../math/MathNode.js';
import { float, vec3, vec4 } from '../shadernode/ShaderNode.js';
import { AONode } from '../lighting/AONode.js';
import { EnvironmentNode } from '../lighting/EnvironmentNode.js';
import { Node } from '../core/Node.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

export interface IUniform<TValue = any> {
  value: TValue;
}

export interface ShaderMaterialParameters extends Material.Parameters {
  uniforms?: Record<string, IUniform>;
  uniformsGroups?: UniformsGroup[];
  vertexShader?: string;
  fragmentShader?: string;
  linewidth?: number;
  wireframe?: boolean;
  wireframeLinewidth?: number;
  lights?: boolean;
  clipping?: boolean;
  fog?: boolean;
  extensions?: {
    derivatives?: boolean;
    fragDepth?: boolean;
    drawBuffers?: boolean;
    shaderTextureLOD?: boolean;
  };
  glslVersion?: GLSLVersion;
}

const NodeMaterials = new Map();

export class NodeMaterial extends ShaderMaterial {
  isNodeMaterial: true = true;
  type: string;

  lights: boolean;
  normals: boolean;
  unlit: boolean;
  colorSpace: boolean;

  outputNode: Node | null;
  vertexNode: Node | null;

  lightsNode: Node | null;
  envNode: Node | null;
  colorNode: Node | null;
  normalNode: Node | null;
  opacityNode: Node | null;
  backdropNode: Node | null;
  backdropAlphaNode: Node | null;
  alphaTestNode: Node | null;
  positionNode: Node | null;
  flatShading: boolean;
  envMap: any;
  emissiveNode: Node | null;

  constructor() {
    super();

    this.isNodeMaterial = true;

    this.type = this.constructor.name;

    this.forceSinglePass = false;

    this.unlit = this.constructor === NodeMaterial.prototype.constructor; // Extended materials are not unlit by default

    this.fog = true;
    this.lights = true;
    this.normals = true;
    this.colorSpace = true;

    this.lightsNode = null;
    this.envNode = null;

    this.colorNode = null;
    this.normalNode = null;
    this.opacityNode = null;
    this.backdropNode = null;
    this.backdropAlphaNode = null;
    this.alphaTestNode = null;

    this.positionNode = null;

    this.outputNode = null;
    this.vertexNode = null;
  }

  static fromMaterial(material: Material | MaterialNode) {
    if ('isNodeMaterial' in material) return material;

    const type = material.type.replace('Material', 'NodeMaterial');

    const nodeMaterial = createNodeMaterialFromType(type);

    if (nodeMaterial === undefined) {
      throw new Error(`NodeMaterial: Material "${material.type}" is not compatible.`);
    }

    for (const key in material) {
      //@ts-expect-error
      nodeMaterial[key] = material[key];
    }

    return nodeMaterial;
  }

  customProgramCacheKey() {
    return this.type + getCacheKey(this);
  }

  build(builder: NodeBuilder) {
    this.construct(builder);
  }

  construct(builder: NodeBuilder) {
    // < VERTEX STAGE >

    builder.addStack();

    builder.stack.outputNode = this.constructPosition(builder);

    builder.addFlow('vertex', builder.removeStack());

    // < FRAGMENT STAGE >

    builder.addStack();

    let outputNode;

    if (this.unlit === false) {
      if (this.normals === true) this.constructNormal(builder);

      this.constructDiffuseColor(builder);
      this.constructVariants(builder);

      const outgoingLightNode = this.constructLighting(builder);

      outputNode = this.constructOutput(builder, vec4(outgoingLightNode, PropertyNodes.diffuseColor.a));

      // OUTPUT NODE

      builder.stack.assign(PropertyNodes.output, outputNode);

      //

      if (this.outputNode !== null) outputNode = this.outputNode;
    } else {
      outputNode = this.constructOutput(builder, this.outputNode || vec4(0, 0, 0, 1));
    }

    builder.stack.outputNode = outputNode;

    builder.addFlow('fragment', builder.removeStack());
  }

  constructPosition(builder: NodeBuilder) {
    const object = builder.object;
    const geometry = object.geometry;

    builder.addStack();

    if (geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color) {
      builder.stack.add(morph(object));
    }

    if (object.isSkinnedMesh === true) {
      builder.stack.add(skinning(object));
    }

    if (
      object.instanceMatrix &&
      object.instanceMatrix.isInstancedBufferAttribute === true &&
      //@ts-expect-error
      builder.isAvailable('instance') === true
    ) {
      builder.stack.add(instance(object));
    }

    if (this.positionNode !== null) {
      builder.stack.assign(PositionNodes.local, this.positionNode);
    }

    builder.context.vertex = builder.removeStack();

    return this.vertexNode || modelViewProjection();
  }

  constructDiffuseColor({ stack, geometry }: any) {
    let colorNode = this.colorNode ? vec4(this.colorNode) : MaterialNodes.color;

    // VERTEX COLORS

    if (this.vertexColors && geometry.hasAttribute('color')) {
      colorNode = vec4(colorNode.xyz.mul(attribute('color')), colorNode.a);
    }

    // COLOR

    stack.assign(PropertyNodes.diffuseColor, colorNode);

    // OPACITY

    const opacityNode = this.opacityNode ? float(this.opacityNode) : MaterialNodes.opacity;
    stack.assign(PropertyNodes.diffuseColor.a, PropertyNodes.diffuseColor.a.mul(opacityNode));

    // ALPHA TEST

    if (this.alphaTestNode !== null || this.alphaTest > 0) {
      const alphaTestNode = this.alphaTestNode !== null ? float(this.alphaTestNode) : MaterialNodes.alphaTest;

      stack.add(PropertyNodes.diffuseColor.a.lessThanEqual(alphaTestNode).discard());
    }
  }

  constructVariants(builder: NodeBuilder) {
    // Interface function.
  }

  constructNormal({ stack }: any) {
    // NORMAL VIEW

    if (this.flatShading) {
      const fdx = dFdx(PositionNodes.view);
      const fdy = dFdy(PositionNodes.view.negate()); // use -positionView ?
      const normalNode = fdx.cross(fdy).normalize();

      stack.assign(NormalNodes.transformed.view, normalNode);
    } else {
      const normalNode = this.normalNode ? vec3(this.normalNode) : ExtendedMaterialNodes.normal;

      stack.assign(NormalNodes.transformed.view, normalNode);
    }
  }

  getEnvNode(builder: NodeBuilder) {
    let node = null;

    if (this.envNode) {
      node = this.envNode;
    } else if (this.envMap) {
      node = this.envMap.isCubeTexture ? cubeTexture(this.envMap) : texture(this.envMap);
    } else if (builder.environmentNode) {
      node = builder.environmentNode;
    }

    return node;
  }

  constructLights(builder: NodeBuilder) {
    const envNode = this.getEnvNode(builder);

    //

    const materialLightsNode = [];

    if (envNode) {
      materialLightsNode.push(new EnvironmentNode(envNode));
    }

    if (builder.material.aoMap) {
      materialLightsNode.push(new AONode(texture(builder.material.aoMap)));
    }

    let lightsNode = this.lightsNode || builder.lightsNode;

    if (materialLightsNode.length > 0) {
      lightsNode = lightsWithoutWrap([...lightsNode.lightNodes, ...materialLightsNode]);
    }

    return lightsNode;
  }

  constructLightingModel(builder: NodeBuilder) {
    // Interface function.
  }

  constructLighting(builder: NodeBuilder) {
    const { material } = builder;
    const { backdropNode, backdropAlphaNode, emissiveNode } = this;

    // OUTGOING LIGHT

    const lights = this.lights || this.lightsNode !== null;

    const lightsNode = lights ? this.constructLights(builder) : null;

    let outgoingLightNode = PropertyNodes.diffuseColor.rgb;

    if (lightsNode && lightsNode.hasLight !== false) {
      const lightingModelNode = this.constructLightingModel(builder);

      outgoingLightNode = lightsNode.lightingContext(lightingModelNode, backdropNode, backdropAlphaNode);
    } else if (backdropNode !== null) {
      outgoingLightNode = vec3(
        backdropAlphaNode !== null ? mix(outgoingLightNode, backdropNode, backdropAlphaNode) : backdropNode,
      );
    }

    // EMISSIVE

    if (emissiveNode?.isNode || material.emissive?.isColor) {
      outgoingLightNode = outgoingLightNode.add(emissiveNode ? vec3(emissiveNode) : MaterialNodes.emissive);
    }

    return outgoingLightNode;
  }

  constructOutput(builder: NodeBuilder, outputNode: Node) {
    const renderer = builder.renderer;

    // TONE MAPPING

    const toneMappingNode = builder.toneMappingNode;

    if (toneMappingNode) {
      //@ts-expect-error
      outputNode = vec4(toneMappingNode.context({ color: outputNode.rgb }), outputNode.a);
    }

    // FOG

    if (this.fog === true) {
      const fogNode = builder.fogNode;

      //@ts-expect-error
      if (fogNode) outputNode = vec4(fogNode.mixAssign(outputNode.rgb), outputNode.a);
    }

    // ENCODING

    if (this.colorSpace === true) {
      const renderTarget = renderer.getRenderTarget();

      let outputColorSpace;

      if (renderTarget !== null) {
        outputColorSpace = renderTarget.texture.colorSpace;
      } else {
        outputColorSpace = renderer.outputColorSpace;
      }

      if (outputColorSpace !== LinearSRGBColorSpace && outputColorSpace !== NoColorSpace) {
        //@ts-expect-error
        outputNode = outputNode.linearToColorSpace(outputColorSpace);
      }
    }

    return outputNode;
  }

  setDefaultValues(material: Material) {
    // This approach is to reuse the native refreshUniforms*
    // and turn available the use of features like transmission and environment in core

    for (const property in material) {
      //@ts-expect-error
      const value = material[property];

      //@ts-expect-error
      if (this[property] === undefined) {
        //@ts-expect-error
        this[property] = value;

        //@ts-expect-error
        if (value && value.clone) this[property] = value.clone();
      }
    }

    Object.assign(this.defines, material.defines);

    const descriptors = Object.getOwnPropertyDescriptors(material.constructor.prototype);

    for (const key in descriptors) {
      if (
        Object.getOwnPropertyDescriptor(this.constructor.prototype, key) === undefined &&
        descriptors[key].get !== undefined
      ) {
        Object.defineProperty(this.constructor.prototype, key, descriptors[key]);
      }
    }
  }

  copy(source: NodeMaterial) {
    this.lightsNode = source.lightsNode;
    this.envNode = source.envNode;

    this.colorNode = source.colorNode;
    this.normalNode = source.normalNode;
    this.opacityNode = source.opacityNode;
    this.backdropNode = source.backdropNode;
    this.backdropAlphaNode = source.backdropAlphaNode;
    this.alphaTestNode = source.alphaTestNode;

    this.positionNode = source.positionNode;

    this.outputNode = source.outputNode;
    this.vertexNode = source.vertexNode;

    return super.copy(source);
  }
}

export function addNodeMaterial(nodeMaterial: any) {
  NodeMaterials.set(nodeMaterial.name, nodeMaterial);
}

export function createNodeMaterialFromType(type: any) {
  const Material = NodeMaterials.get(type);

  if (Material) return new Material();
}

addNodeMaterial(NodeMaterial);
