import { TempNode } from '../core/TempNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { Node } from '../core/Node.js';

export class PackingNode extends TempNode {
  scope: PackingNode.Scope;
  node: Node;

  constructor(scope: PackingNode.Scope, node: Node) {
    super();

    this.scope = scope;
    this.node = node;
  }

  getNodeType(builder: NodeBuilder) {
    return this.node.getNodeType(builder);
  }

  construct() {
    switch (this.scope) {
      case PackingNode.Scope.DirectionToColor:
        return this.node.mul(0.5).add(0.5);
      case PackingNode.Scope.ColorToDirection:
        return this.node.mul(2.0).sub(1);
    }
  }
}
export namespace PackingNode {
  export enum Scope {
    DirectionToColor = 'directionToColor',
    ColorToDirection = 'colorToDirection',
  }
}
export namespace PackingNodes {
  export const directionToColor = nodeProxy(PackingNode, PackingNode.Scope.DirectionToColor);
  export const colorToDirection = nodeProxy(PackingNode, PackingNode.Scope.ColorToDirection);
}

addNodeElement('directionToColor', PackingNodes.directionToColor);
addNodeElement('colorToDirection', PackingNodes.colorToDirection);
