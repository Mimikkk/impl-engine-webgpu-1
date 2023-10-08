import { ContextNode } from '../core/ContextNode.js';
import { add } from '../math/OperatorNode.js';
import { mix } from '../math/MathNode.js';
import { addNodeElement, float, nodeProxy, vec3 } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { Node } from '../core/Node.js';
import { LightingModel } from '../core/LightingModel.js';
import { NodeType } from '../core/constants.js';

export class LightingContextNode extends ContextNode {
  lightingModel: LightingModel | null;
  backdropNode: Node | null;
  backdropAlphaNode: Node | null;
  indirectDiffuseNode?: Node;
  indirectSpecularNode?: Node;
  ambientOcclusionNode?: Node;

  constructor(
    node: Node,
    lightingModel: LightingModel | null = null,
    backdropNode: Node | null = null,
    backdropAlphaNode: Node | null = null,
  ) {
    super(node);

    this.lightingModel = lightingModel;
    this.backdropNode = backdropNode;
    this.backdropAlphaNode = backdropAlphaNode;
  }

  getNodeType(builder: NodeBuilder) {
    return NodeType.Vector3;
  }

  construct(builder: NodeBuilder) {
    const { lightingModel, backdropNode, backdropAlphaNode } = this;

    const context = (this.context = {}); // reset context
    const properties = builder.getNodeProperties(this);

    const directDiffuse = vec3().temp(),
      directSpecular = vec3().temp(),
      indirectDiffuse = vec3().temp(),
      indirectSpecular = vec3().temp();

    let totalDiffuse = add(directDiffuse, indirectDiffuse);

    if (backdropNode !== null) {
      totalDiffuse = vec3(
        backdropAlphaNode !== null ? mix(totalDiffuse, backdropNode, backdropAlphaNode) : backdropNode,
      );
    }

    const totalSpecular = add(directSpecular, indirectSpecular);
    const total = add(totalDiffuse, totalSpecular).temp();

    const reflectedLight = {
      directDiffuse,
      directSpecular,
      indirectDiffuse,
      indirectSpecular,
      total,
    };

    const lighting = {
      radiance: vec3().temp(),
      irradiance: vec3().temp(),
      iblIrradiance: vec3().temp(),
      ambientOcclusion: float(1).temp(),
    };

    //@ts-expect-error
    context.reflectedLight = reflectedLight;
    //@ts-expect-error
    context.lightingModel = lightingModel || context.lightingModel;

    Object.assign(properties, reflectedLight, lighting);
    Object.assign(context, lighting);

    if (lightingModel) {
      lightingModel.init(context, builder.stack, builder);

      lightingModel.indirectDiffuse(context, builder.stack, builder);
      lightingModel.indirectSpecular(context, builder.stack, builder);
      lightingModel.ambientOcclusion(context, builder.stack, builder);
    }

    return super.construct(builder);
  }

  generate(builder: NodeBuilder) {
    //@ts-expect-error
    const { context } = this;
    const type = this.getNodeType(builder);

    super.generate(builder, type);

    return context.reflectedLight.total.build(builder, type);
  }
}

export const lightingContext = nodeProxy(LightingContextNode);

addNodeElement('lightingContext', lightingContext);
