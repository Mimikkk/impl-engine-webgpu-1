import { Node } from '../core/Node.js';
import { reference } from './ReferenceNode.js';
import { materialReference } from './MaterialReferenceNode.js';
import { float } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

export class MaterialNode extends Node {
  scope: MaterialNode.Scope;

  constructor(scope: MaterialNode.Scope) {
    super();

    this.scope = scope;
  }

  getFloat(property: string) {
    return materialReference(property, NodeType.Float);
  }

  getColor(property: string) {
    return materialReference(property, NodeType.Color);
  }

  getTexture(property: string) {
    return materialReference(property, NodeType.Texture);
  }

  construct(builder: NodeBuilder) {
    const material = builder.context.material;
    const scope = this.scope;

    let node = null;

    if (
      scope === MaterialNode.Scope.AlphaTest ||
      scope === MaterialNode.Scope.Shininess ||
      scope === MaterialNode.Scope.Reflectivity ||
      scope === MaterialNode.Scope.Rotation ||
      scope === MaterialNode.Scope.Iridescence ||
      scope === MaterialNode.Scope.IridescenceIor
    ) {
      node = this.getFloat(scope);
    } else if (scope === MaterialNode.Scope.SpecularColor) {
      node = this.getColor('specular');
    } else if (scope === MaterialNode.Scope.Color) {
      const colorNode = this.getColor('color');

      if (material.map && material.map.isTexture === true) {
        node = colorNode.mul(this.getTexture('map'));
      } else {
        node = colorNode;
      }
    } else if (scope === MaterialNode.Scope.Opacity) {
      const opacityNode = this.getFloat('opacity');

      if (material.alphaMap && material.alphaMap.isTexture === true) {
        node = opacityNode.mul(this.getTexture('alphaMap'));
      } else {
        node = opacityNode;
      }
    } else if (scope === MaterialNode.Scope.SpecularStrength) {
      if (material.specularMap && material.specularMap.isTexture === true) {
        node = this.getTexture('specularMap').r;
      } else {
        node = float(1);
      }
    } else if (scope === MaterialNode.Scope.Roughness) {
      const roughnessNode = this.getFloat('roughness');

      if (material.roughnessMap && material.roughnessMap.isTexture === true) {
        node = roughnessNode.mul(this.getTexture('roughnessMap').g);
      } else {
        node = roughnessNode;
      }
    } else if (scope === MaterialNode.Scope.Metalness) {
      const metalnessNode = this.getFloat('metalness');

      if (material.metalnessMap && material.metalnessMap.isTexture === true) {
        node = metalnessNode.mul(this.getTexture('metalnessMap').b);
      } else {
        node = metalnessNode;
      }
    } else if (scope === MaterialNode.Scope.Emissive) {
      const emissiveNode = this.getColor('emissive');

      if (material.emissiveMap && material.emissiveMap.isTexture === true) {
        node = emissiveNode.mul(this.getTexture('emissiveMap'));
      } else {
        node = emissiveNode;
      }
    } else if (scope === MaterialNode.Scope.Clearcoat) {
      const clearcoatNode = this.getFloat('clearcoat');

      if (material.clearcoatMap && material.clearcoatMap.isTexture === true) {
        node = clearcoatNode.mul(this.getTexture('clearcoatMap').r);
      } else {
        node = clearcoatNode;
      }
    } else if (scope === MaterialNode.Scope.ClearcoatRoughness) {
      const clearcoatRoughnessNode = this.getFloat('clearcoatRoughness');

      if (material.clearcoatRoughnessMap && material.clearcoatRoughnessMap.isTexture === true) {
        node = clearcoatRoughnessNode.mul(this.getTexture('clearcoatRoughnessMap').r);
      } else {
        node = clearcoatRoughnessNode;
      }
    } else if (scope === MaterialNode.Scope.Sheen) {
      const sheenNode = this.getColor('sheenColor').mul(this.getFloat('sheen')); // Move this mul() to CPU

      if (material.sheenColorMap && material.sheenColorMap.isTexture === true) {
        node = sheenNode.mul(this.getTexture('sheenColorMap').rgb);
      } else {
        node = sheenNode;
      }
    } else if (scope === MaterialNode.Scope.SheenRoughness) {
      const sheenRoughnessNode = this.getFloat('sheenRoughness');

      if (material.sheenRoughnessMap && material.sheenRoughnessMap.isTexture === true) {
        node = sheenRoughnessNode.mul(this.getTexture('sheenRoughnessMap').a);
      } else {
        node = sheenRoughnessNode;
      }

      node = node.clamp(0.07, 1.0);
    } else if (scope === MaterialNode.Scope.IridescenceThickness) {
      const iridescenceThicknessMaximum = reference(1, 'float', material.iridescenceThicknessRange);

      if (material.iridescenceThicknessMap) {
        const iridescenceThicknessMinimum = reference(0, 'float', material.iridescenceThicknessRange);

        node = iridescenceThicknessMaximum
          .sub(iridescenceThicknessMinimum)
          .mul(this.getTexture('iridescenceThicknessMap').g)
          .add(iridescenceThicknessMinimum);
      } else {
        node = iridescenceThicknessMaximum;
      }
    } else {
      const outputType = this.getNodeType(builder);

      node = materialReference(scope, outputType as any);
    }

    return node;
  }
}

export namespace MaterialNode {
  export enum Scope {
    AlphaTest = 'alphaTest',
    Color = 'color',
    Opacity = 'opacity',
    Shininess = 'shininess',
    Specular = 'specular',
    SpecularStrength = 'specularStrength',
    SpecularColor = 'specularColor',
    Reflectivity = 'reflectivity',
    Roughness = 'roughness',
    Metalness = 'metalness',
    Clearcoat = 'clearcoat',
    ClearcoatRoughness = 'clearcoatRoughness',
    Emissive = 'emissive',
    Rotation = 'rotation',
    Sheen = 'sheen',
    SheenRoughness = 'sheenRoughness',
    Iridescence = 'iridescence',
    IridescenceIor = 'iridescenceIOR',
    IridescenceThickness = 'iridescenceThickness',
  }
}

export namespace MaterialNodes {
  export const alphaTest = new MaterialNode(MaterialNode.Scope.AlphaTest);
  export const color = new MaterialNode(MaterialNode.Scope.Color);
  export const opacity = new MaterialNode(MaterialNode.Scope.Opacity);
  export const specularColor = new MaterialNode(MaterialNode.Scope.SpecularColor);
  export const shininess = new MaterialNode(MaterialNode.Scope.Shininess);
  export const specular = new MaterialNode(MaterialNode.Scope.Specular);
  export const specularStrength = new MaterialNode(MaterialNode.Scope.SpecularStrength);
  export const reflectivity = new MaterialNode(MaterialNode.Scope.Reflectivity);
  export const roughness = new MaterialNode(MaterialNode.Scope.Roughness);
  export const metalness = new MaterialNode(MaterialNode.Scope.Metalness);
  export const clearcoat = new MaterialNode(MaterialNode.Scope.Clearcoat);
  export const clearcoatRoughness = new MaterialNode(MaterialNode.Scope.ClearcoatRoughness);
  export const emissive = new MaterialNode(MaterialNode.Scope.Emissive);
  export const rotation = new MaterialNode(MaterialNode.Scope.Rotation);
  export const sheen = new MaterialNode(MaterialNode.Scope.Sheen);
  export const sheenRoughness = new MaterialNode(MaterialNode.Scope.SheenRoughness);
  export const iridescence = new MaterialNode(MaterialNode.Scope.Iridescence);
  export const iridescenceIor = new MaterialNode(MaterialNode.Scope.IridescenceIor);
  export const iridescenceThickness = new MaterialNode(MaterialNode.Scope.IridescenceThickness);
}
