import { Node } from '../core/Node.js';
import { NodeType, NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { nodeImmutable, vec2 } from '../shadernode/ShaderNode.js';

import { Vector2 } from '../../Three.js';
import { NodeBuilder } from '../core/NodeBuilder.js';
import { Renderer } from '../../common/Renderer.js';

let resolution: any;

export class ViewportNode extends Node {
  scope: ViewportNode.Scope;

  constructor(scope: ViewportNode.Scope) {
    super();
    this.scope = scope;
  }

  getNodeType() {
    switch (this.scope) {
      case ViewportNode.Scope.Coordinate:
        return NodeType.Vector4;
      default:
        return NodeType.Vector2;
    }
  }

  getUpdateType() {
    let updateType = NodeUpdateType.None;

    if (this.scope === ViewportNode.Scope.Resolution) {
      updateType = NodeUpdateType.Frame;
    }

    this.updateType = updateType;
    return updateType;
  }

  update({ renderer }: { renderer: Renderer }) {
    renderer.getDrawingBufferSize(resolution);
  }

  construct(builder: NodeBuilder) {
    const scope = this.scope;

    if (scope === ViewportNode.Scope.Coordinate) return;
    if (scope === ViewportNode.Scope.Resolution) {
      return uniform(resolution || (resolution = new Vector2()));
    }

    const coordinateNode = vec2(new ViewportNode(ViewportNode.Scope.Coordinate));
    const resolutionNode = new ViewportNode(ViewportNode.Scope.Resolution);

    let output = coordinateNode.div(resolutionNode);

    let outX = output.x;
    let outY = output.y;

    if (/top/i.test(scope) && builder.isFlipY()) outY = outY.oneMinus();
    else if (/bottom/i.test(scope) && builder.isFlipY() === false) outY = outY.oneMinus();

    if (/right/i.test(scope)) outX = outX.oneMinus();

    return vec2(outX, outY);
  }

  generate(builder: NodeBuilder) {
    if (this.scope === ViewportNode.Scope.Coordinate) {
      return builder.getFragCoord();
    }

    return super.generate(builder);
  }
}

export namespace ViewportNode {
  export enum Scope {
    Coordinate = 'coordinate',
    Resolution = 'resolution',
    TopLeft = 'topLeft',
    BottomLeft = 'bottomLeft',
    TopRight = 'topRight',
    BottomRight = 'bottomRight',
  }
}

export namespace ViewportNodes {
  export const coordinate = nodeImmutable(ViewportNode, ViewportNode.Scope.Coordinate);
  export const resolution = nodeImmutable(ViewportNode, ViewportNode.Scope.Resolution);
  export const topLeft = nodeImmutable(ViewportNode, ViewportNode.Scope.TopLeft);
  export const bottomLeft = nodeImmutable(ViewportNode, ViewportNode.Scope.BottomLeft);
  export const topRight = nodeImmutable(ViewportNode, ViewportNode.Scope.TopRight);
  export const bottomRight = nodeImmutable(ViewportNode, ViewportNode.Scope.BottomRight);
}
