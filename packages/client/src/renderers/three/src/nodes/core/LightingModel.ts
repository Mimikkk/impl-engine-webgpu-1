import StackNode from './StackNode.js';
import NodeBuilder from './NodeBuilder.js';

abstract class LightingModel {
  init(input: any, stack: StackNode, builder: NodeBuilder) {}

  direct(input: any, stack: StackNode, builder: NodeBuilder) {}

  indirectDiffuse(input: any, stack: StackNode, builder: NodeBuilder) {}

  indirectSpecular(input: any, stack: StackNode, builder: NodeBuilder) {}

  ambientOcclusion(input: any, stack: StackNode, builder: NodeBuilder) {}
}

export default LightingModel;
