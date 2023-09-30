import { MaterialNode } from './MaterialNode.js';
import { materialReference } from './MaterialReferenceNode.js';
import { normalView } from './NormalNode.js';
import { normalMap } from '../display/NormalMapNode.js';
import { bumpMap } from '../display/BumpMapNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

export class ExtendedMaterialNode extends MaterialNode {
  constructor(scope) {
    super(scope);
  }

  getNodeType(builder) {
    const scope = this.scope;
    let type = null;

    if (scope === ExtendedMaterialNode.Scope.Normal || scope === ExtendedMaterialNode.Scope.ClearcoatNormal) {
      type = 'vec3';
    }

    return type || super.getNodeType(builder);
  }

  construct(builder: NodeBuilder) {
    const material = builder.material;
    const scope = this.scope;

    let node = null;

    if (scope === ExtendedMaterialNode.Scope.Normal) {
      if (material.normalMap) {
        node = normalMap(this.getTexture('normalMap'), materialReference('normalScale', 'vec2'));
      } else if (material.bumpMap) {
        node = bumpMap(material.bumpMap, materialReference('bumpScale', 'float'));
      } else {
        node = normalView;
      }
    } else if (scope === ExtendedMaterialNode.Scope.ClearcoatNormal) {
      node = material.clearcoatNormalMap
        ? normalMap(this.getTexture('clearcoatNormalMap'), materialReference('clearcoatNormalScale', 'vec2'))
        : normalView;
    }

    return node || super.construct(builder);
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
