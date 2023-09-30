import { MaterialNode } from './MaterialNode.js';
import { materialReference } from './MaterialReferenceNode.js';
import { NormalNodes } from './NormalNode.js';
import { normalMap } from '../display/NormalMapNode.js';
import { bumpMap } from '../display/BumpMapNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

export class ExtendedMaterialNode extends MaterialNode {
  declare scope: ExtendedMaterialNode.Scope;

  constructor(scope: ExtendedMaterialNode.Scope) {
    super(scope);
  }

  getNodeType(builder: NodeBuilder) {
    switch (this.scope) {
      case ExtendedMaterialNode.Scope.Normal:
      case ExtendedMaterialNode.Scope.ClearcoatNormal:
        return 'vec3';
      default:
        return super.getNodeType(builder);
    }
  }

  construct(builder: NodeBuilder) {
    const material = builder.material;

    switch (this.scope) {
      case ExtendedMaterialNode.Scope.Normal:
        if (material.normalMap) {
          return normalMap(this.getTexture('normalMap'), materialReference('normalScale', NodeType.Vector2));
        } else if (material.bumpMap) {
          return bumpMap(material.bumpMap, materialReference('bumpScale', NodeType.Float));
        } else {
          return NormalNodes.view;
        }
      case ExtendedMaterialNode.Scope.ClearcoatNormal:
        return material.clearcoatNormalMap
          ? normalMap(
              this.getTexture('clearcoatNormalMap'),
              materialReference('clearcoatNormalScale', NodeType.Vector2),
            )
          : NormalNodes.view;
      default:
        return super.construct(builder);
    }
  }
}

export namespace ExtendedMaterialNode {
  export enum Scope {
    Normal = 'normal',
    ClearcoatNormal = 'clearcoatNormal',
  }
}

export namespace ExtendedMaterialNodes {
  export const normal = nodeImmutable(ExtendedMaterialNode, ExtendedMaterialNode.Scope.Normal);
  export const clearcoatNormal = nodeImmutable(ExtendedMaterialNode, ExtendedMaterialNode.Scope.ClearcoatNormal);
}
