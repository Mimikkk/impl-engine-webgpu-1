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

    switch (this.scope) {
      case MaterialNode.Scope.AlphaTest:
      case MaterialNode.Scope.Shininess:
      case MaterialNode.Scope.Reflectivity:
      case MaterialNode.Scope.Rotation:
      case MaterialNode.Scope.Iridescence:
      case MaterialNode.Scope.IridescenceIor:
        return this.getFloat(this.scope);
      case MaterialNode.Scope.SpecularColor:
        return this.getColor('specular');
      case MaterialNode.Scope.Color:
        const colorNode = this.getColor('color');
        if (material.map?.isTexture) return colorNode.mul(this.getTexture('map'));
        return colorNode;
      case MaterialNode.Scope.Opacity:
        const opacityNode = this.getFloat('opacity');
        if (material.alphaMap?.isTexture) {
          return opacityNode.mul(this.getTexture('alphaMap'));
        }
        return opacityNode;
      case MaterialNode.Scope.SpecularStrength:
        if (material.specularMap?.isTexture) {
          return this.getTexture('specularMap').r;
        }
        return float(1);
      case MaterialNode.Scope.Roughness:
        const roughnessNode = this.getFloat('roughness');
        if (material.roughnessMap?.isTexture) {
          return roughnessNode.mul(this.getTexture('roughnessMap').g);
        }
        return roughnessNode;
      case MaterialNode.Scope.Metalness:
        const metalnessNode = this.getFloat('metalness');
        if (material.metalnessMap?.isTexture) {
          return metalnessNode.mul(this.getTexture('metalnessMap').b);
        }
        return metalnessNode;
      case MaterialNode.Scope.Emissive:
        const emissiveNode = this.getColor('emissive');
        if (material.emissiveMap?.isTexture) {
          return emissiveNode.mul(this.getTexture('emissiveMap'));
        }
        return emissiveNode;
      case MaterialNode.Scope.Clearcoat:
        const clearcoatNode = this.getFloat('clearcoat');
        if (material.clearcoatMap?.isTexture) {
          return clearcoatNode.mul(this.getTexture('clearcoatMap').r);
        }
        return clearcoatNode;
      case MaterialNode.Scope.ClearcoatRoughness:
        const clearcoatRoughnessNode = this.getFloat('clearcoatRoughness');
        if (material.clearcoatRoughnessMap?.isTexture)
          return clearcoatRoughnessNode.mul(this.getTexture('clearcoatRoughnessMap').r);
        return clearcoatRoughnessNode;
      case MaterialNode.Scope.Sheen:
        const sheenNode = this.getColor('sheenColor').mul(this.getFloat('sheen'));
        if (material.sheenColorMap?.isTexture) return sheenNode.mul(this.getTexture('sheenColorMap').rgb);
        return sheenNode;
      case MaterialNode.Scope.SheenRoughness:
        const sheenRoughnessNode = this.getFloat('sheenRoughness');

        let node = material.sheenRoughnessMap?.isTexture
          ? sheenRoughnessNode.mul(this.getTexture('sheenRoughnessMap').a)
          : sheenRoughnessNode;

        return node.clamp(0.07, 1.0);
      case MaterialNode.Scope.IridescenceThickness:
        const iridescenceThicknessMaximum = reference(1, 'float', material.iridescenceThicknessRange);
        if (material.iridescenceThicknessMap) {
          const iridescenceThicknessMinimum = reference(0, 'float', material.iridescenceThicknessRange);
          return iridescenceThicknessMaximum
            .sub(iridescenceThicknessMinimum)
            .mul(this.getTexture('iridescenceThicknessMap').g)
            .add(iridescenceThicknessMinimum);
        }
        return iridescenceThicknessMaximum;
      default:
        return materialReference(this.scope, this.getNodeType(builder) as any);
    }
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
