import { Node } from './Node.js';

import { assign } from '../math/OperatorNode.js';
import { bypass } from './BypassNode.js';
import { expression } from '../code/ExpressionNode.js';
import { cond, CondNode } from '../math/CondNode.js';
import { loop } from '../utils/LoopNode.js';
import { nodeProxy, shader } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from './NodeBuilder.js';
import { NodeType } from './constants.js';

export class StackNode extends Node {
  nodes: Node[];
  outputNode: Node | null;
  parent: Node | null;
  _currentCond: CondNode | null;
  isStackNode: boolean;

  constructor(parent = null) {
    super();

    this.nodes = [];
    this.outputNode = null;

    this.parent = parent;

    this._currentCond = null;

    this.isStackNode = true;
  }

  getNodeType(builder: NodeBuilder) {
    return this.outputNode ? this.outputNode.getNodeType(builder) : NodeType.Void;
  }

  add(node: Node) {
    this.nodes.push(bypass(expression(), node));

    return this;
  }

  if(boolNode: Node, method: any) {
    const methodNode = shader(method);
    this._currentCond = cond(boolNode, methodNode);

    return this.add(this._currentCond!);
  }

  elseif(boolNode: Node, method: any) {
    const methodNode = shader(method);
    const ifNode = cond(boolNode, methodNode);

    this._currentCond!.elseNode = ifNode;
    this._currentCond = ifNode;

    return this;
  }

  else(method: any) {
    this._currentCond!.elseNode = shader(method);

    return this;
  }

  assign(targetNode: Node, sourceValue: Node) {
    return this.add(assign(targetNode, sourceValue));
  }

  loop(...params: any[]) {
    return this.add(loop(...params));
  }

  build(builder: NodeBuilder, ...params: any[]) {
    for (const node of this.nodes) node.build(builder, NodeType.Void);

    return this.outputNode ? this.outputNode.build(builder, ...params) : super.build(builder, ...params);
  }
}

export const stack = nodeProxy(StackNode);
