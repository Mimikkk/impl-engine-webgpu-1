import { Node } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { addNodeElement, nodeObject } from '../shadernode/ShaderNode.js';
import { Renderer } from '../../common/Renderer.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

export class ComputeNode extends Node {
  isComputeNode: boolean = true;
  computeNode: Node;
  count: number;
  workgroupSize: number[];
  dispatchCount: number;
  version: number;

  constructor(computeNode: Node, count: number, workgroupSize: number[] = [64]) {
    super('void');

    this.isComputeNode = true;

    this.computeNode = computeNode;

    this.count = count;
    this.workgroupSize = workgroupSize;
    this.dispatchCount = 0;

    this.version = 1;
    this.updateType = NodeUpdateType.Object;

    this.updateDispatchCount();
  }

  set needsUpdate(value: boolean) {
    if (value) ++this.version;
  }

  dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }

  updateDispatchCount() {
    const { count, workgroupSize } = this;

    let size = workgroupSize[0];

    for (let i = 1; i < workgroupSize.length; i++) size *= workgroupSize[i];

    this.dispatchCount = Math.ceil(count / size);
  }

  onInit() {}

  update({ renderer }: { renderer: Renderer }) {
    renderer.compute(this);
  }

  generate(builder: NodeBuilder) {
    const { shaderStage } = builder;

    if (shaderStage === 'compute') {
      const snippet = this.computeNode.build(builder, 'void');

      if (snippet !== '') {
        builder.addLineFlowCode(snippet);
      }
    }
  }
}

export const compute = (node: Node, count: number, workgroupSize: number[]) =>
  nodeObject(new ComputeNode(nodeObject(node), count, workgroupSize));

addNodeElement('compute', compute);
