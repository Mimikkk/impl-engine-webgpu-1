import { TempNode } from '../core/TempNode.js';
import { uv, UVNode } from '../accessors/UVNode.js';
import { addNodeElement, nodeProxy, tslFn } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeType } from '../core/constants.js';

const checkerShaderNode = tslFn((inputs: any) => {
  const uv = inputs.uv.mul(2.0);

  const cx = uv.x.floor();
  const cy = uv.y.floor();
  const result = cx.add(cy).mod(2.0);

  return result.sign();
});

export class CheckerNode extends TempNode {
  uvNode: UVNode;

  constructor(uvNode: UVNode = uv()) {
    super(NodeType.Float);

    this.uvNode = uvNode;
  }

  generate(builder: NodeBuilder) {
    return checkerShaderNode({ uv: this.uvNode }).build(builder);
  }
}

export const checker = nodeProxy(CheckerNode);

addNodeElement('checker', checker);
