import ReferenceNode from './ReferenceNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { Material } from '../../materials/Material.js';
import { NodeType } from '../core/constants.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeFrame } from '../core/NodeFrame.js';

class MaterialReferenceNode extends ReferenceNode {
  material: Material | null;

  constructor(property: string, inputType: NodeType, material: Material | null = null) {
    super(property, inputType, material);
    this.material = material;
  }

  construct(builder: NodeBuilder) {
    const material = this.material !== null ? this.material : builder.material;

    //@ts-expect-error
    this.node!.value = material[this.property];

    return super.construct(builder);
  }

  update(frame: NodeFrame) {
    this.object = this?.material ?? frame.material;

    super.update(frame);
  }
}

export default MaterialReferenceNode;

export const materialReference = (name: string, type: NodeType, material: Material | null = null) =>
  nodeObject(new MaterialReferenceNode(name, type, material));
